import 'intl';
import "intl/locale-data/jsonp/en";
function intlFormat(num: any) {
    return new Intl.NumberFormat().format(Math.round(num * 10) / 10);
}
export default function convertNumber(num: any) {
    if (num >= 1000000)
        return intlFormat(num / 1000000) + 'M';
    if (num >= 1000)
        return intlFormat(num / 1000) + 'k';
    return intlFormat(num);
}
