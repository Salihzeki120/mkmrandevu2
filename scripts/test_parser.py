import re
import sqlite3
from html.parser import HTMLParser

class SimpleTableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_td = False
        self.current_row = []
        self.rows = []

    def handle_starttag(self, tag, attrs):
        if tag in ('td', 'th'):
            self.in_td = True
            self.data_parts = []
        elif tag == 'tr':
            self.current_row = []

    def handle_endtag(self, tag):
        if tag in ('td', 'th'):
            self.in_td = False
            cell_text = " ".join("".join(self.data_parts).split())
            self.current_row.append(cell_text)
        elif tag == 'tr':
            if any(c.strip() for c in self.current_row):
                self.rows.append(self.current_row)

    def handle_data(self, data):
        if self.in_td:
            self.data_parts.append(data)

def parse_html_table(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    parser = SimpleTableParser()
    parser.feed(content)
    return parser.rows

if __name__ == '__main__':
    rows = parse_html_table('scripts/table1.html')
    print(f"Table 1 row count: {len(rows)}")
    if rows:
        print("Header:", rows[0])
        print("Row 1:", rows[1])
        print("Last row:", rows[-1])
