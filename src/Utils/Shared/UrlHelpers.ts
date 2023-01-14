export const changeUrl = (e: any) => {
    const urlPattern = new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/);
    let string = e;

    if (urlPattern.test(string)) {
        ///clear http && https from string
        string = string.replace("https://", "").replace("http://", "");

        //add https to string
    }
    string = `https://${string}`;
    return string
}
