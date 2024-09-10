export default {
    "plugins": {
      "postcss-purgecss": {
        content: ["src/comp/*.js"],
        css: ["src/css/styles.css"]
      }
    }
  }

module.exports = {
content: ['src/comp/*.js'],
css: ['src/css/styles.css']
}


const purgecss = await new PurgeCSS().purge()
// or use the path to the file as the only parameter
const purgecss = await new PurgeCSS().purge('./purgecss.config.js')