import MarkdownIt = require('markdown-it');
import mdContainer from 'markdown-it-container';
import mdEmoji from 'markdown-it-emoji';

const mdCollapsible = require('markdown-it-collapsible');
const mdDeflist = require('markdown-it-deflist');
const mdFootnote = require('markdown-it-footnote');
const mdIns = require('markdown-it-ins');
const mdMark = require('markdown-it-mark');
const mdSub = require('markdown-it-sub');
const mdSup = require('markdown-it-sup');

const md = new MarkdownIt({
  breaks: true,
  quotes: '“”‘’',
  typographer: true,
});

/** Class to instantiate markdown translation. */
export class MardownHelper {
  tags = [
    'archive',  // ::: archive
    'archives', // ::: archives
    'doc',      // ::: doc
    'docs',     // ::: docs
    'email',    // ::: email
    'emails',   // ::: email
    'figma',    // ::: figma
    'file',     // ::: file
    'files',    // ::: files
    'film',     // ::: film
    'films',    // ::: films
    'image',    // ::: image
    'images',   // ::: images
    'mail',     // ::: mail
    'mails',    // ::: mails
    'pdf',      // ::: pdf
    'pdfs',     // ::: pdfs
    'slide',    // ::: slide
    'slides',   // ::: slides
    'sketch',   // ::: sketch
    'sheet',    // ::: sheet
    'sheets',   // ::: sheets
    'site',     // ::: site
    'sites',    // ::: sites
    'video',    // ::: video
    'videos',   // ::: videos
    'web',      // ::: web
    'website',  // ::: website
    'websites', // ::: websites
    'zip',      // ::: zip
  ];
  // private tagCSS_ = 'notes__icon';

  constructor() {
    this.init_();
    this.configureCustomTags_();
  }

  /** Initiatlizes MarkdownIt and all related plugins. */
  private init_() {
    md.use(mdContainer);
    md.use(mdCollapsible);
    md.use(mdDeflist);
    md.use(mdEmoji);
    md.use(mdFootnote);
    md.use(mdIns);
    md.use(mdMark);
    md.use(mdSub);
    md.use(mdSup);

    // https://github.com/markdown-it/markdown-it/blob/df4607f1d4d4be7fdc32e71c04109aea8cc373fa/docs/architecture.md
    const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      const aIndex = tokens[idx].attrIndex('target');
      if (aIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']);
      } else {
        //@ts-ignore
        tokens[idx].attrs[aIndex][1] = '_blank';
      }

      return defaultRender(tokens, idx, options, env, self);
    };
  }

  /** Configure custom tags and appropriate HTML rendering markup. */
  private configureCustomTags_() {
    this.tags.forEach(tag => {
      const re = new RegExp(`^${tag}\\s+(.*)$`, 'gi');

      md.use(mdContainer, tag, {
        validate: (params: string) => {
          return params.trim().match(re);
        },
        render: (tokens: any, index: number) => {
          const m = tokens[index].info.trim().match(re);
          if (tokens[index].nesting === 1) {
            m[0] = m[0].replace(tag, '').trim();
            // TODO (frederickk): Is there a more efficient way to do this?
            let html = md.render(m[0]);
            const re = new RegExp(/<\s*p[^>]*>(.*?)<\s*\/\s*p>/, 'gi');
            const label = re.exec(html)?.pop();
            html = html.replace(label || '', '');

            return `<chip><icon class="icon icon--${tag}"></icon>${label}</chip>${html}\n`;
          } else {
            return '\n';
          }
        },
      });
    });
  }

  /** Renders Markdown string as HTML. */
  render(str: string = '') {
    return md.render(str);
  }
}
