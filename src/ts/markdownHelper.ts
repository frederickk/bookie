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

export class MardownHelper {
  tags = [
    'doc',    // ::: doc
    'docs',   // ::: docs
    'file',   // ::: file
    'film',   // ::: film
    'image',  // ::: image
    'pdf',    // ::: pdf
    'slide',  // ::: slide
    'slides', // ::: slides
    'sketch', // ::: sketch
    'sheet',  // ::: sheet
    'sheets', // ::: sheets
    'site',   // ::: site
    'sites',  // ::: sites
    'video',  // ::: video
    'web',    // ::: web
    'zip',    // ::: zip
  ];
  private tagCSS_ = 'notes__icon';

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
    this.tags.forEach((item) => {
      const re = new RegExp(`^${item}\\s+(.*)$`, 'gi');

      md.use(mdContainer, item, {
        validate: (params: string) => {
          return params.trim().match(re);
        },
        render: (tokens: any, index: number) => {
          const m = tokens[index].info.trim().match(re);
          if (tokens[index].nesting === 1) {
            m[0] = m[0].replace(item, '').trim();
            return `<span class="${this.tagCSS_} ${this.tagCSS_}--${item}"></span>${md.render(m[0])}\n`;
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
