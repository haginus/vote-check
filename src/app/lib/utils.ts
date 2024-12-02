export function setBarColor(color: string) {
  document.getElementsByTagName("body")[0].style.backgroundColor = color;
}

export function getBarColor() {
  const color = document.getElementsByTagName("body")[0].style.backgroundColor;
  return color ? rgbToHex(color) : "#ffffff";
}

export function rgbToHex(rgb: string) {
  return "#" + rgb.match(/\d+/g).map((x) => {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }).join('');
}

export function shadeColor(color: string, percent: number) {

  var R = parseInt(color.substring(1,3),16);
  var G = parseInt(color.substring(3,5),16);
  var B = parseInt(color.substring(5,7),16);

  R = Math.floor(R * (100 + percent) / 100);
  G = Math.floor(G * (100 + percent) / 100);
  B = Math.floor(B * (100 + percent) / 100);

  R = (R<255)?R:255;
  G = (G<255)?G:255;
  B = (B<255)?B:255;

  R = Math.round(R)
  G = Math.round(G)
  B = Math.round(B)

  var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}

export function formatWithSign(n: number) {
  return n > 0 ? '+' + n : n;
}
