# Chao XU — personal website

Static personal homepage and two browser tools, hosted with GitHub Pages.

## Recovery draft (2026-10-16)

The previous homepage used `jekyll-theme-minimal` on `theme_customization`.
Its profile content was last edited on 2025-04-01. Adding the root
`.nojekyll` file on 2026-09-01 stopped Markdown/theme rendering; no root
`index.html` was supplied, so the homepage returns 404.

This draft brings the avatar and profile into a static `index.html`, keeping
the Minimal theme's sidebar and resume structure. It preserves the existing
public profile wording, name and contact information as a recovery baseline.
Review those details and update the employment history before publishing.

## Contents

| URL | Files | Source preserved |
| --- | --- | --- |
| `/` | `index.html`, `assets/css/home.css`, `assets/img/avatar.jpeg` | Profile and avatar from `theme_customization` |
| `/kotoba-align-asr-ner/` | `kotoba-align-asr-ner/` | Latest deployed `theme_customization` version, including partial review export and removal of the extra ASR acknowledgement |
| `/speech-annotation-tool/` | `speech-annotation-tool/` | Existing `main` version, unchanged |

Edit `index.html` for homepage content and `assets/css/home.css` for layout.
The pre-existing root `index.md` and `_config.yml` are legacy references and
do not generate the current static homepage. The original customized
Markdown remains available in `theme_customization`.

Keep root `.nojekyll`: the two exported tools require their `_next/` assets
to be served as static files. Removing it without adjusting the build can
break the tools.

## Preview

From a checkout of this branch:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/` and check the homepage and both tool paths.
No dependencies or build step are required.

## Publish after review

1. Review the old profile content, especially the display name, current base,
   contact address and employment after August 2024.
2. Merge this recovery branch into `main`.
3. In repository **Settings → Pages**, keep **Deploy from a branch**, select
   **main** and **/ (root)**, then save. The current selection is
   `theme_customization` and `/ (root)`.
4. Wait for the Pages deployment to succeed and verify all three URLs.

The draft PR does not change the Pages source or the live site.
After recovery, continue all updates from `main`; retain
`theme_customization` as historical reference until its content is checked.

## Tool development

These tool directories contain exported static builds, not their original
Next.js source projects. Rebuild larger changes in their source repositories,
then replace the matching exported directory here.
