# Applied ML Portfolio | Vijay Sai Kilari

Weekly machine learning portfolio artifacts for my MS in Artificial Intelligence and Data Analytics.

Live site: https://omsairamkvs99.github.io/ml-portfolio/

Main AI/ML portfolio: https://omsairamkvs99.github.io/

## Artifacts

| # | Artifact | Link |
|---|----------|------|
| 01 | ML Algorithm Framework: twelve algorithms classified by learning style and domain | [Open](https://omsairamkvs99.github.io/ml-portfolio/artifacts/01-ml-algorithm-framework/) |

## Structure

```
index.html                  homepage, builds the artifact list from assets/js/artifacts.js
assets/css/site.css         shared colors, fonts, header and footer
assets/js/artifacts.js      artifact registry, add one entry per week
artifacts/01-.../           each artifact lives in its own folder
```

## Adding a new artifact

1. Create a folder such as `artifacts/02-artifact-name/` with its own `index.html`.
2. Link `../../assets/css/site.css` in that page so it matches the rest of the site.
3. Add one entry to `assets/js/artifacts.js` with `status: "live"`.
4. Commit and push. GitHub Pages updates within a minute or two.
