---
"@inkorange/space-ui": patch
---

PieChart: a donut with a single slice (one value at 100%) cuts its hole in the middle again. The hole's arc ended just left of the top, which made the browser draw it on a circle above the ring, so a dark disc covered the ring's top edge instead.
