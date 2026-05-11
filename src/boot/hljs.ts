import hljs from 'highlight.js/lib/core'

import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import handlebars from 'highlight.js/lib/languages/handlebars'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import nginx from 'highlight.js/lib/languages/nginx'
import pgsql from 'highlight.js/lib/languages/pgsql'
import scss from 'highlight.js/lib/languages/scss'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'


hljs.registerLanguage('bash', bash)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('handlebars', handlebars)
hljs.registerLanguage('java', java)
hljs.registerLanguage('json', json)
hljs.registerLanguage('nginx', nginx)
hljs.registerLanguage('shell', shell)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('pgsql', pgsql)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('scss', scss)


export { hljs }
