/**
 * create by WangCheng on 2019/12/13 11:05
 */

export interface IRichTextStyle
{
    text: string,
    font?: string,
    size?: number,
    color?: string,
    bold?: boolean,
    underline?: boolean
    stroke?: number,
    strokeColor?: string,
    vertical?:boolean;
}


namespace RichTextParser
{
    /**
     * 将文本样式数组 转化为HTML片段
     * @param segments
     */
    export function parseTextStyleToHTML(segments: IRichTextStyle[]): string
    {
        let html = '';
        for (let s of segments)
        {
            html += parseTextStyle(s);
        }
        return html;
    }

    function parseTextStyle(segment: IRichTextStyle): string
    {
        if (!segment || !segment.text) return '';

        let style = 'white-space:pre-wrap;';
        if (segment.color)
        {
            style += `color:${segment.color};`;
        }
        if (segment.font)
        {
            style += `font-family:${segment.font};`;
        }

        if (segment.size)
        {
            style += `font-size:${segment.size}px;`;
        }

        if (segment.bold)
        {
            style += 'font-weight:bold;';
        }
        if (segment.underline)
        {
            style += 'text-decoration:underline;';
        }
        if (segment.stroke > 0)
        {
            segment.strokeColor = segment.strokeColor || '#000';
            style += `text-stroke: ${segment.stroke}px ${segment.strokeColor};`;
        }
        if(segment.vertical) {
            style += 'writing-mode:vertical-lr;-webkit-writing-mode:vertical-lr;-ms-writing-mode: vertical-lr;';
        }

        let ret = segment.text.match(/\n/g);
        let len = 0;
        if (ret)
        {
            segment.text = segment.text.replace(/\n/g, "");
            len = ret.length;
        }
        let br = '';
        for (let i = 0; i < len; i++)
        {
            br += '<br/>';
        }
        let html = `<span style="${style}">${segment.text}</span>${br}`;

        return html;
    }

    /**
     * 当前仅支持一下标签
     * <c=#fff></c> 颜色
     * <b></b> 粗体
     * <u></u> 下划线
     * <size=36></size> 字号
     */
    export function parseRichTextToHTML(richText: string): string
    {
        let tagStack = [];
        let tag = richText.match(/<.+?>/);
        if (!tag) return richText;
        let html = richText.substr(0, tag[0].length);

        let tagRet = parseTag(tag[0]);
        tagStack.push(tagRet.tagName);


        return richText;
    }

    function parseTag(tag: string): { tagName: string, value: string, closed: boolean }
    {
        let match = tag.match(/<(\/?)(.+)>/);
        let closed = !!match[1];
        let nameValue = match[2].split("=");
        let tagName = nameValue[0];
        let value = nameValue[1];
        return {tagName: tagName, value: value, closed: closed}
    }


    /**
     * 解析类似 '{#fff000}文本',这样的问题
     * @param text
     */
    export function parseColorText(text: string): string
    {
        let typeKey = text.match(/{.+?}/);
        if (!typeKey)
        {
            return text;
        }  //返回默认白色文本
        let mark = typeKey[0];
        let index = 0;
        while (mark)
        {
            index++;
            let color = mark.slice(1, -1);
            let span;
            if (index <= 1)
            {
                span = `<span color='${color}'>`;
                text = `${text}</span>`;
            }
            else
            {
                span = `</span><span color='${color}'>`;
            }
            text = text.replace(mark, span);
            typeKey = text.match(/{.+?}/);
            if (!typeKey)
            {
                return text;
            }
            mark = typeKey[0];
        }
        return text;

    }
}

export default RichTextParser;
window['RichTextParser'] = RichTextParser;