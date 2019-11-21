module.exports = {
  /**
   * Removes given element from the DOM.
   * @param {HTMLElement} item
   */
  removeElement: (item) => {
    item.parentNode.removeChild(item);
  },

  /**
   * Toggles multiple classes for a single element.
   * @param {HTMLElement} item
   * @param {String} cls
   */
  toggleMultiple: (item, cls = '') => {
    const clss = cls.split(/\s/);
    clss.forEach((str) => {
      item.classList.toggle(str);
    });
  },

  /**
   * Localizes the menu items.
   * @param {*} menuItems
   */
  localize: (menuItems) => {
    let str = '';
    menuItems.forEach((item) => {
      str = item.innerHTML.replace(/__MSG_(\w+)__/g, (match, val) => {
        return val
          ? chrome.i18n.getMessage(val)
          : '';
      });
      item.innerHTML = str;
    });
  },

  /**
   * Slugifies a given string.
   * @url https://gist.github.com/mathewbyrne/1280286
   * @param {String} text
   * @returns Slugified string.
   */
  slugify: (text) => {
    return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  },

  /**
   * Checks if given string is a valid URL.
   * @url https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
   * @param {String} str
   * @return True if valid, false otherwise.
   */
  checkValidURL: (str) => {
    const pattern = new RegExp('^(https?:\\/\\/)?'+
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
      '((\\d{1,3}\\.){3}\\d{1,3}))'+
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
      '(\\?[;&a-z\\d%_.~+=-]*)?'+
      '(\\#[-a-z\\d_]*)?$','i');

    return !!pattern.test(str);
  },

  /**
   * Checks if given Input element has value.
   * @param {HTMLInputElement} element
   * @param {String} errCls  CSS error class name.
   * @return {Boolean} Returns true of has error, false otherwise.
   */
  checkValueError: (element, errCls) => {
    if (!element.value) {
      element.classList.toggle(errCls);

      return true;

    } else {
      element.classList.remove(errCls);

      return false;
    }
  },

  /**
   * Retrieve value from URL params.
   * @return  {Object}
   */
  getUrlParams: () => {
    let vars = {};
    const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
      (m, key, value) => {
        vars[key] = value;
      }
    );

    return vars;
  },

  /**
   * [download_ description]
   * @param   {[type]}  data      [data description]
   * @param   {[type]}  filename  [filename description]
   * @param   {[type]}  mimetype  [type description]
   * @return  {[type]}            [return description]
   */
  download: (data, filename, mimetype) => {
    const file = new Blob([data], {
      type: mimetype,
    });

    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(file, filename);
    } else {
      const a = document.createElement('a');
      const url = URL.createObjectURL(file);

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      window.setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  },

};
