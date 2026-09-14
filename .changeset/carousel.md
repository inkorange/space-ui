---
"@inkorange/space-ui": minor
---

Add Carousel: a row of slides that scrolls sideways, built on native CSS scroll snapping so a flick on a phone uses the platform's own momentum and lands on a slide. `perView` takes fractions (`2.5` leaves half a slide at the edge), `step` chooses whether the arrows move by one slide or by a page, and `showPagination` adds dots beneath. Override `--sp-carousel-view-count` in a media query to change how many slides fit at a breakpoint, and `--sp-carousel-gap-size` for the space between them.
