# -*- coding: utf-8 -*-
"""
regen_docs.py — .md 정본에서 파생 산출물(docx 12개 + 문서뷰어.html) 재생성.

.md 파일이 정본이다. 이 스크립트는 그것을 공유용으로 내보낸다.
 - docs/docx/*.docx : pandoc(여러 문서 형식을 서로 변환해주는 프로그램. 여기선
   파이썬에서 그걸 호출하는 pypandoc_binary 패키지를 씀)으로 각 .md → .docx
 - 문서뷰어.html    : <script id="payload"> JSON 배열의 md만 현재 내용으로 교체
                      (file/title/sub/순서 메타데이터는 기존 것 보존)

실행: python3 scripts/regen_docs.py
의존성: pypandoc_binary (pip install pypandoc_binary)
"""

import json
import os
import re

import pypandoc

VIEWER = "문서뷰어.html"
DOCX_DIR = "docs/docx"
MD_DIR = "docs/markdown"


def source_path(file: str) -> str:
    """payload의 file 필드 → 실제 .md 경로. CLAUDE.md만 저장소 루트."""
    if file == "CLAUDE.md":
        return "CLAUDE.md"
    return os.path.join(MD_DIR, file)


def load_payload_meta():
    html = open(VIEWER, encoding="utf-8").read()
    m = re.search(r'(<script id="payload" type="application/json">)(.*?)(</script>)', html, re.S)
    if not m:
        raise RuntimeError("payload 스크립트 태그를 찾지 못함")
    entries = json.loads(m.group(2))
    return html, m, entries


def regen_viewer():
    html, m, entries = load_payload_meta()
    for e in entries:
        src = source_path(e["file"])
        e["md"] = open(src, encoding="utf-8").read()
    new_payload = json.dumps(entries, ensure_ascii=False)
    new_html = html[: m.start(2)] + new_payload + html[m.end(2) :]
    with open(VIEWER, "w", encoding="utf-8") as f:
        f.write(new_html)
    print(f"재생성: {VIEWER} ({len(entries)}개 문서)")
    return entries


def regen_docx(entries):
    os.makedirs(DOCX_DIR, exist_ok=True)
    for e in entries:
        src = source_path(e["file"])
        base = os.path.splitext(os.path.basename(e["file"]))[0]
        dst = os.path.join(DOCX_DIR, base + ".docx")
        pypandoc.convert_file(src, "docx", outputfile=dst, extra_args=["--from=gfm"])  # gfm = GitHub식 마크다운 문법으로 읽으라는 옵션
        print(f"  {src} → {dst}")


if __name__ == "__main__":
    entries = regen_viewer()
    print("docx 변환 중...")
    regen_docx(entries)
    print("완료.")
