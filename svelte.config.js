import adapter from '@sveltejs/adapter-static';

// GitHub Pages serves the project at /<repo-name>/. CI passes the repo name in
// BASE_PATH so renaming the repository can never break the deployed asset URLs.
const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
  },
  kit: {
    adapter: adapter({
      fallback: '404.html'
    }),
    paths: {
      base,
      relative: false
    }
  }
};

export default config;
