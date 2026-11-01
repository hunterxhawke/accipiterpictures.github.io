# Accipiter Pictures / Hunter Hawke Sound

Website for Hunter Hawke: films under the Accipiter Pictures label and production sound services as Hunter Hawke Sound.

Plain HTML and CSS with no build step, hosted on GitHub Pages.

- `index.html`: the whole site
- `assets/`: logos, woodcut textures, photos, posters, film stills and client logos
- `assets/logos-original/`, `assets/borders-original/`, `assets/stamps-original/`: untouched source files from the brand kit

## Staging and publishing

1. Work on the `wip` branch.
2. `scripts/stage.sh` publishes the current commit to the staging site at
   https://hunterxhawke.github.io/accipiterpictures-staging/. The CNAME file is left out, so staging never claims the custom domain.
3. Once a change is approved, merge `wip` into `main` and push to `origin`. That publishes it to accipiterpictures.com.
