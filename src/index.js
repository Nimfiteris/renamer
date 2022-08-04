var fs= require('fs');

var start=23
,   end=42
,   block="18"
,   section="36"
,   src="Block 18 Lot 23-42 36 Section.pdf"
;

for (var i=start; i<=end; i++)
{
    fs.copyFileSync(src, `Block ${block} Lot {num} ${section} Section.pdf`.replace('{num}', i));
}