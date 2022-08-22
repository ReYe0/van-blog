import { writeClipBoardText } from '@/services/van-blog/clipboard';
import { message } from 'antd';
import { StaticItem } from '../type';
export const getImgLink = (realPath) => {
  let url = `${window.location.protocol}//${window.location.host}${realPath}`;
  if (realPath.includes('http://') || realPath.includes('https://')) {
    url = realPath;
  }
  return url.replace(/\)/g, '%29');
};
export const copyImgLink = (realPath, isMarkdown = false) => {
  let url = getImgLink(realPath);
  if (isMarkdown) {
    url = `![](${url})`;
  }
  writeClipBoardText(url).then((res) => {
    if (res) {
      message.success(`已复制${isMarkdown ? ' markdown ' : '图片'}链接到剪切板！`);
    } else {
      message.error('复制链接到剪切板失败！');
    }
  });
};
export const mergeMetaInfo = (item: StaticItem) => {
  const Dic = {
    type: '格式',
    height: '高',
    width: '宽',
    name: '名称',
    sign: 'md5',
    storageType: '存储',
    url: '外链',
    size: '大小',
  };
  const KeyDic = {
    local: '本地',
  };
  let url = getImgLink(item.realPath);
  const rawObj = {
    name: item.name,
    ...item.meta,
    sign: item.sign,
    storageType: item.storageType,
    url,
  };
  const res = {};

  for (const [k, v] of Object.entries(rawObj)) {
    res[Dic[k] || k] = KeyDic[v as any] || v;
  }
  return res;
};
export const downloadImg = (name, url) => {
  const tag = document.createElement('a');
  // 此属性的值就是下载时图片的名称，注意，名称中不能有半角点，否则下载时后缀名会错误
  tag.setAttribute('download', name);
  tag.href = `https://192.168.5.11:3002${url}`;
  tag.dispatchEvent(new MouseEvent('click'));
};
