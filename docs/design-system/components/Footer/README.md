# Footer

모든 페이지 맨 아래의 공통 푸터로, 위에는 'Green Issue' 워드마크를 꽉 채우고 아래에는 작은 라벨과 링크를 모읍니다.

- 바탕 `surface-footer`, 위 테두리 `line` 1px, `overflow: hidden`, `container-type: inline-size`.
- 워드마크: `wordmark-footer`(Bague Scout, `brand-deep`), 위 여백 `space-30`(120px), 좌우 `space-20`(80px), 가운데 정렬 한 줄. 크기 `calc((100cqw - 160px) / 6.2)` — 푸터 너비에 맞춰 바뀌고 글자 끝이 잘리지 않게 여유를 둡니다.
- 아래 칸: 최대 너비 `content-max`, 위 `space-18`(72px), 구분선 `line` 뒤 왼쪽 SNS(라벨 13px SemiBold `ink-muted` + 링크 목록), 오른쪽 `meta` 안내 문구.
- SNS 채널은 아직 정하지 않았습니다. 정해지기 전에는 점선 미정 표시를 둡니다.
- 워드마크는 잡지 제호처럼 보이지 않게 색은 `brand-deep` 하나만 쓰고, 다른 장식을 더하지 않습니다.
