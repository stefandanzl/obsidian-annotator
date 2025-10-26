type YoutubeMetaData = {
    title: string;
    description: string;
    keywords: string;
    shortlinkUrl: string;
    embedinfo: {
        title: string;
        author_name: string;
        author_url: string;
        type: string;
        height: number;
        width: number;
        version: string;
        provider_name: string;
        provider_url: string;
        thumbnail_height: number;
        thumbnail_width: number;
        thumbnail_url: string;
        html: string;
    };
};

export default function getYouTubeMetaData(
    fetchFunc: (url: string) => Promise<Response>,
    youtube: string
): Promise<YoutubeMetaData> {
    return new Promise(async (ok, erro) => {
        if (/((http|https):\/\/)?(www\.)?((youtube\.com)|(youtu\.be))(\/)?([a-zA-Z0-9\-\.]+)\/?/.test(youtube)) {
            try {
                const body = await (await fetchFunc(youtube)).text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(body, 'text/html');

                const title = doc.querySelector('meta[name="title"]')?.getAttribute('content');
                const description = doc.querySelector('meta[name="description"]')?.getAttribute('content');
                const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content');
                const shortlinkUrl = doc.querySelector('link[rel="shortlinkUrl"]')?.getAttribute('href');
                const ur = doc.querySelector('link[type="application/json+oembed"]')?.getAttribute('href');

                const iem = ur && ur != '' ? await (await fetchFunc(ur.replace('http:', 'https:'))).text() : undefined;
                const embedinfo = ur ? (iem ? JSON.parse(iem) : null) : null;
                ok({ title, description, keywords, shortlinkUrl, embedinfo });
            } catch (e) {
                erro({ message: 'Error', errorcode: 2, erroca: e });
            }
        } else {
            erro({ message: 'Non Valid youtube Link!', errorcode: 1 });
        }
    });
}
