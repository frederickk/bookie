/**
 * Checks if given Input element has value.
 * @param errCls  CSS error class name.
 */
 export const checkValueError = (element: HTMLInputElement, errCls: string)
    : boolean => {
  if (!element.value) {
    element.classList.toggle(errCls);
    return true;
  } else {
    element.classList.remove(errCls);
    return false;
  }
};

/** Checks if given string is a valid URL. */
export const checkValidURL = (str: string): boolean => {
  const pattern = new RegExp('^(https?:\\/\\/)?'+
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
    '((\\d{1,3}\\.){3}\\d{1,3}))'+
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
    '(\\?[;&a-z\\d%_.~+=-]*)?'+
    '(\\#[-a-z\\d_]*)?$', 'i');

  return !!pattern.test(str);
};

/** Programatically downloads a given piece of data. */
export const download = (data: number | string, filename: string,
    mimetype: string) => {
  const file = new Blob([data.toString()], {
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
    }, 10);
  }
};

/** Retrieves value from URL params. */
export const getUrlParams = (): any => {
  const vars: any = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
      // @ts-ignore
      (_m: string, key: any, value: any) => {
        vars[key] = value;
  });

  return vars;
};

/** Removes given element from the DOM. */
export const removeElement = (item: HTMLElement) => {
  item.parentNode?.removeChild(item);
};

/** Slugifies a given string. */
export const slugify = (text: number | string): string => {
  return text?.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/** Converts string to hex. */
export const strTohex = (str: string): string => {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }

  return result;
};

/** Toggles multiple classes for a single element. */
export const toggleMultiple = (item: HTMLElement, cls = '') => {
  const clss = cls.split(/\s/);
  clss.forEach((str) => {
    item.classList.toggle(str);
  });
};
