import fs from 'fs'
// @ts-ignore
import PDFParser from "pdf2json";

fs.readdir("./content", (err, files) => {
	return Promise.all(files.map((file) => {
		const fileName = `./content/${file}`
		return new Promise((y, n) => {
			
			const pdfParser = new PDFParser();
			pdfParser.on("pdfParser_dataError", (errData: any) => {
				console.error("Parser error", errData.parserError);
				n(new Error(errData))
			} );
			pdfParser.on("pdfParser_dataReady", ({ Transcoder, Meta, Pages }: any) => {
				const data = Pages.map((page: any) =>  page.Texts.map((t: any) => t.R).filter((t:any) => {
					// console.log(t);
					const [fontFaceId, fontSize, isBold, isItalic] = t[0].TS;
					return fontSize > 16 && isBold && fontSize < 20
				}))[0];

				const result = data.map(([text]: any) => decodeURIComponent( text.T )).join(' ')
					.replace(/\//g, "-");
			
				fs.copyFile(fileName, `./dist/${result}.pdf`, (err: any) => {
					if (err) {
						console.error(`ERROR COPYING ${fileName} to ${result}`, err)
						return n(err);
					}
					console.log(`Copying ${fileName} to ${result} finished`)
					y(data)
				})
			
			});
	
			pdfParser.loadPDF(fileName);
		})
	}))
	.then((data) => {
		console.log("FINISHED: #", data.length)
		fs.writeFileSync("./output.json", JSON.stringify(data, undefined, "\t"));
	}).catch((error) => {
		console.error(error);
	});
})