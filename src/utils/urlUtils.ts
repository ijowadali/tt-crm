/**
 * Add the object as a parameter splicing to the URL
 * @param baseUrl the url that needs splicing
 * @param obj parameter object
 * @returns {string} spliced ​​object
 * example:
 * let obj = {a: '3', b: '4'}
 * setObjToUrlParams('www.baidu.com', obj)
 * ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: object): string {
  let parameters = '';
  let url = '';
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key]) + '&';
  }
  parameters = parameters.replace(/&$/, '');
  if (/\?$/.test(baseUrl)) {
    url = baseUrl + parameters;
  } else {
    url = baseUrl.replace(/\/?$/, '?') + parameters;
  }
  return url;
}
