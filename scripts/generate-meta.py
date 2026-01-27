#!/usr/bin/env python3
"""
Generate meta.json files for Fumadocs from docs.json navigation structure.
"""

import json
import os
from pathlib import Path
from collections import defaultdict

# Read docs.json
docs_json_path = Path(__file__).parent.parent.parent / 'docs.json'
with open(docs_json_path, 'r', encoding='utf-8') as f:
    docs_json = json.load(f)

# Track which directories we've created meta.json for
created_metas = set()


def get_page_name(page_path: str) -> str:
    """Extract filename without extension from page path."""
    return page_path.split('/')[-1]


def get_page_dir(page_path: str) -> str:
    """Get directory path from page path."""
    return '/'.join(page_path.split('/')[:-1])


def find_first_page(items: list):
    """Find the first actual page path in a nested structure."""
    for item in items:
        if isinstance(item, str):
            return item
        elif isinstance(item, dict) and 'pages' in item:
            found = find_first_page(item['pages'])
            if found:
                return found
    return None


def create_meta_json(dir_path: str, title: str, pages: list[str]):
    """Create a meta.json file in the given directory."""
    if dir_path in created_metas:
        return

    full_path = Path(__file__).parent.parent.parent / dir_path
    if not full_path.exists():
        print(f"  Skip (dir not found): {dir_path}")
        return

    created_metas.add(dir_path)

    meta = {
        "title": title,
        "pages": pages
    }

    meta_path = full_path / 'meta.json'
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
        f.write('\n')

    print(f"  Created: {meta_path}")


def process_group(group: dict, parent_path: str = None):
    """Process a group and its nested pages."""
    pages_list = group.get('pages', [])
    if not pages_list:
        return

    # Find the directory for this group
    first_page = find_first_page(pages_list)
    if not first_page:
        return

    dir_path = get_page_dir(first_page)
    title = group.get('group', '')

    # Build the pages array for meta.json
    pages = []
    for item in pages_list:
        if isinstance(item, str):
            pages.append(get_page_name(item))
        elif isinstance(item, dict) and 'pages' in item:
            # Nested group - add the subdirectory name
            nested_first = find_first_page(item['pages'])
            if nested_first:
                nested_dir = get_page_dir(nested_first)
                subdir_name = nested_dir.split('/')[-1]
                if subdir_name not in pages:
                    pages.append(subdir_name)
                # Recursively process nested group
                process_group(item)

    if pages:
        create_meta_json(dir_path, title, pages)


def process_dropdown(dropdown: dict, lang: str):
    """Process a dropdown section."""
    # Handle pages-based dropdowns
    if 'pages' in dropdown:
        for section in dropdown['pages']:
            if isinstance(section, dict):
                # Section with group name
                section_pages = section.get('pages', [])
                for item in section_pages:
                    if isinstance(item, dict) and 'pages' in item:
                        process_group(item)

    # Handle groups-based dropdowns (like API reference)
    if 'groups' in dropdown:
        for group in dropdown['groups']:
            if 'pages' in group:
                process_group(group)


def get_dropdown_dirname(dropdown_name: str) -> str:
    """Convert dropdown name to directory name."""
    name_lower = dropdown_name.lower()
    if 'dify' in name_lower and ('use' in name_lower or '使用' in name_lower or '使う' in name_lower):
        return 'use-dify'
    elif 'self' in name_lower or '自托管' in name_lower or 'セルフ' in name_lower:
        return 'self-host'
    elif 'plugin' in name_lower or '插件' in name_lower or 'プラグイン' in name_lower:
        return 'develop-plugin'
    elif 'api' in name_lower:
        return 'api-reference'
    else:
        return name_lower.replace(' ', '-')


def main():
    print("Generating meta.json files from docs.json...\n")

    for version in docs_json['navigation']['versions']:
        for lang_config in version['languages']:
            lang = lang_config['language']
            print(f"Processing language: {lang}")

            # Create root meta.json for language
            root_pages = []
            for dropdown in lang_config['dropdowns']:
                dirname = get_dropdown_dirname(dropdown['dropdown'])
                root_pages.append(dirname)

                # Process dropdown contents
                process_dropdown(dropdown, lang)

            # Determine root title
            if lang == 'en':
                root_title = 'Documentation'
            elif lang == 'zh':
                root_title = '文档'
            elif lang == 'ja':
                root_title = 'ドキュメント'
            else:
                root_title = 'Documentation'

            create_meta_json(lang, root_title, root_pages)

            # Create meta.json for each top-level directory (use-dify, self-host, etc.)
            for dropdown in lang_config['dropdowns']:
                dirname = get_dropdown_dirname(dropdown['dropdown'])
                dir_path = f"{lang}/{dirname}"

                if not (Path(__file__).parent.parent.parent / dir_path).exists():
                    continue

                # Get subdirectories from the dropdown structure
                subdirs = []
                if 'pages' in dropdown:
                    for section in dropdown['pages']:
                        if isinstance(section, dict) and 'pages' in section:
                            for item in section['pages']:
                                if isinstance(item, dict) and 'pages' in item:
                                    first_page = find_first_page(item['pages'])
                                    if first_page:
                                        parts = first_page.split('/')
                                        if len(parts) >= 3:
                                            subdir = parts[2]  # e.g., "getting-started" from "en/use-dify/getting-started/intro"
                                            if subdir not in subdirs:
                                                subdirs.append(subdir)

                if 'groups' in dropdown:
                    for group in dropdown['groups']:
                        if 'pages' in group:
                            first_page = find_first_page(group['pages'])
                            if first_page:
                                parts = first_page.split('/')
                                if len(parts) >= 3:
                                    subdir = parts[2]
                                    if subdir not in subdirs:
                                        subdirs.append(subdir)

                if subdirs:
                    create_meta_json(dir_path, dropdown['dropdown'], subdirs)

            print()

    print("Done!")


if __name__ == '__main__':
    main()
