/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

export function getIdoHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:;">
	<title>Infinite-Dimensional Optimisation</title>
	<style>
.katex{font:normal 1.21em KaTeX_Main,Times New Roman,serif;line-height:1.2;text-indent:0;text-rendering:auto}.katex *{-ms-high-contrast-adjust:none!important;border-color:currentColor}.katex .katex-version:after{content:"0.16.22"}.katex .katex-mathml{clip:rect(1px,1px,1px,1px);border:0;height:1px;overflow:hidden;padding:0;position:absolute;width:1px}.katex .katex-html>.newline{display:block}.katex .base{position:relative;white-space:nowrap;width:-webkit-min-content;width:-moz-min-content;width:min-content}.katex .base,.katex .strut{display:inline-block}.katex .textbf{font-weight:700}.katex .textit{font-style:italic}.katex .textrm{font-family:KaTeX_Main}.katex .textsf{font-family:KaTeX_SansSerif}.katex .texttt{font-family:KaTeX_Typewriter}.katex .mathnormal{font-family:KaTeX_Math;font-style:italic}.katex .mathit{font-family:KaTeX_Main;font-style:italic}.katex .mathrm{font-style:normal}.katex .mathbf{font-family:KaTeX_Main;font-weight:700}.katex .boldsymbol{font-family:KaTeX_Math;font-style:italic;font-weight:700}.katex .amsrm,.katex .mathbb,.katex .textbb{font-family:KaTeX_AMS}.katex .mathcal{font-family:KaTeX_Caligraphic}.katex .mathfrak,.katex .textfrak{font-family:KaTeX_Fraktur}.katex .mathboldfrak,.katex .textboldfrak{font-family:KaTeX_Fraktur;font-weight:700}.katex .mathtt{font-family:KaTeX_Typewriter}.katex .mathscr,.katex .textscr{font-family:KaTeX_Script}.katex .mathsf,.katex .textsf{font-family:KaTeX_SansSerif}.katex .mathboldsf,.katex .textboldsf{font-family:KaTeX_SansSerif;font-weight:700}.katex .mathitsf,.katex .mathsfit,.katex .textitsf{font-family:KaTeX_SansSerif;font-style:italic}.katex .mainrm{font-family:KaTeX_Main;font-style:normal}.katex .vlist-t{border-collapse:collapse;display:inline-table;table-layout:fixed}.katex .vlist-r{display:table-row}.katex .vlist{display:table-cell;position:relative;vertical-align:bottom}.katex .vlist>span{display:block;height:0;position:relative}.katex .vlist>span>span{display:inline-block}.katex .vlist>span>.pstrut{overflow:hidden;width:0}.katex .vlist-t2{margin-right:-2px}.katex .vlist-s{display:table-cell;font-size:1px;min-width:2px;vertical-align:bottom;width:2px}.katex .vbox{align-items:baseline;display:inline-flex;flex-direction:column}.katex .hbox{width:100%}.katex .hbox,.katex .thinbox{display:inline-flex;flex-direction:row}.katex .thinbox{max-width:0;width:0}.katex .msupsub{text-align:left}.katex .mfrac>span>span{text-align:center}.katex .mfrac .frac-line{border-bottom-style:solid;display:inline-block;width:100%}.katex .hdashline,.katex .hline,.katex .mfrac .frac-line,.katex .overline .overline-line,.katex .rule,.katex .underline .underline-line{min-height:1px}.katex .mspace{display:inline-block}.katex .clap,.katex .llap,.katex .rlap{position:relative;width:0}.katex .clap>.inner,.katex .llap>.inner,.katex .rlap>.inner{position:absolute}.katex .clap>.fix,.katex .llap>.fix,.katex .rlap>.fix{display:inline-block}.katex .llap>.inner{right:0}.katex .clap>.inner,.katex .rlap>.inner{left:0}.katex .clap>.inner>span{margin-left:-50%;margin-right:50%}.katex .rule{border:0 solid;display:inline-block;position:relative}.katex .hline,.katex .overline .overline-line,.katex .underline .underline-line{border-bottom-style:solid;display:inline-block;width:100%}.katex .hdashline{border-bottom-style:dashed;display:inline-block;width:100%}.katex .sqrt>.root{margin-left:.2777777778em;margin-right:-.5555555556em}.katex .fontsize-ensurer.reset-size1.size1,.katex .sizing.reset-size1.size1{font-size:1em}.katex .fontsize-ensurer.reset-size1.size2,.katex .sizing.reset-size1.size2{font-size:1.2em}.katex .fontsize-ensurer.reset-size1.size3,.katex .sizing.reset-size1.size3{font-size:1.4em}.katex .fontsize-ensurer.reset-size1.size4,.katex .sizing.reset-size1.size4{font-size:1.6em}.katex .fontsize-ensurer.reset-size1.size5,.katex .sizing.reset-size1.size5{font-size:1.8em}.katex .fontsize-ensurer.reset-size1.size6,.katex .sizing.reset-size1.size6{font-size:2em}.katex .fontsize-ensurer.reset-size1.size7,.katex .sizing.reset-size1.size7{font-size:2.4em}.katex .fontsize-ensurer.reset-size1.size8,.katex .sizing.reset-size1.size8{font-size:2.88em}.katex .fontsize-ensurer.reset-size1.size9,.katex .sizing.reset-size1.size9{font-size:3.456em}.katex .fontsize-ensurer.reset-size1.size10,.katex .sizing.reset-size1.size10{font-size:4.148em}.katex .fontsize-ensurer.reset-size1.size11,.katex .sizing.reset-size1.size11{font-size:4.976em}.katex .fontsize-ensurer.reset-size2.size1,.katex .sizing.reset-size2.size1{font-size:.8333333333em}.katex .fontsize-ensurer.reset-size2.size2,.katex .sizing.reset-size2.size2{font-size:1em}.katex .fontsize-ensurer.reset-size2.size3,.katex .sizing.reset-size2.size3{font-size:1.1666666667em}.katex .fontsize-ensurer.reset-size2.size4,.katex .sizing.reset-size2.size4{font-size:1.3333333333em}.katex .fontsize-ensurer.reset-size2.size5,.katex .sizing.reset-size2.size5{font-size:1.5em}.katex .fontsize-ensurer.reset-size2.size6,.katex .sizing.reset-size2.size6{font-size:1.6666666667em}.katex .fontsize-ensurer.reset-size2.size7,.katex .sizing.reset-size2.size7{font-size:2em}.katex .fontsize-ensurer.reset-size2.size8,.katex .sizing.reset-size2.size8{font-size:2.4em}.katex .fontsize-ensurer.reset-size2.size9,.katex .sizing.reset-size2.size9{font-size:2.88em}.katex .fontsize-ensurer.reset-size2.size10,.katex .sizing.reset-size2.size10{font-size:3.4566666667em}.katex .fontsize-ensurer.reset-size2.size11,.katex .sizing.reset-size2.size11{font-size:4.1466666667em}.katex .fontsize-ensurer.reset-size3.size1,.katex .sizing.reset-size3.size1{font-size:.7142857143em}.katex .fontsize-ensurer.reset-size3.size2,.katex .sizing.reset-size3.size2{font-size:.8571428571em}.katex .fontsize-ensurer.reset-size3.size3,.katex .sizing.reset-size3.size3{font-size:1em}.katex .fontsize-ensurer.reset-size3.size4,.katex .sizing.reset-size3.size4{font-size:1.1428571429em}.katex .fontsize-ensurer.reset-size3.size5,.katex .sizing.reset-size3.size5{font-size:1.2857142857em}.katex .fontsize-ensurer.reset-size3.size6,.katex .sizing.reset-size3.size6{font-size:1.4285714286em}.katex .fontsize-ensurer.reset-size3.size7,.katex .sizing.reset-size3.size7{font-size:1.7142857143em}.katex .fontsize-ensurer.reset-size3.size8,.katex .sizing.reset-size3.size8{font-size:2.0571428571em}.katex .fontsize-ensurer.reset-size3.size9,.katex .sizing.reset-size3.size9{font-size:2.4685714286em}.katex .fontsize-ensurer.reset-size3.size10,.katex .sizing.reset-size3.size10{font-size:2.9628571429em}.katex .fontsize-ensurer.reset-size3.size11,.katex .sizing.reset-size3.size11{font-size:3.5542857143em}.katex .fontsize-ensurer.reset-size4.size1,.katex .sizing.reset-size4.size1{font-size:.625em}.katex .fontsize-ensurer.reset-size4.size2,.katex .sizing.reset-size4.size2{font-size:.75em}.katex .fontsize-ensurer.reset-size4.size3,.katex .sizing.reset-size4.size3{font-size:.875em}.katex .fontsize-ensurer.reset-size4.size4,.katex .sizing.reset-size4.size4{font-size:1em}.katex .fontsize-ensurer.reset-size4.size5,.katex .sizing.reset-size4.size5{font-size:1.125em}.katex .fontsize-ensurer.reset-size4.size6,.katex .sizing.reset-size4.size6{font-size:1.25em}.katex .fontsize-ensurer.reset-size4.size7,.katex .sizing.reset-size4.size7{font-size:1.5em}.katex .fontsize-ensurer.reset-size4.size8,.katex .sizing.reset-size4.size8{font-size:1.8em}.katex .fontsize-ensurer.reset-size4.size9,.katex .sizing.reset-size4.size9{font-size:2.16em}.katex .fontsize-ensurer.reset-size4.size10,.katex .sizing.reset-size4.size10{font-size:2.5925em}.katex .fontsize-ensurer.reset-size4.size11,.katex .sizing.reset-size4.size11{font-size:3.11em}.katex .fontsize-ensurer.reset-size5.size1,.katex .sizing.reset-size5.size1{font-size:.5555555556em}.katex .fontsize-ensurer.reset-size5.size2,.katex .sizing.reset-size5.size2{font-size:.6666666667em}.katex .fontsize-ensurer.reset-size5.size3,.katex .sizing.reset-size5.size3{font-size:.7777777778em}.katex .fontsize-ensurer.reset-size5.size4,.katex .sizing.reset-size5.size4{font-size:.8888888889em}.katex .fontsize-ensurer.reset-size5.size5,.katex .sizing.reset-size5.size5{font-size:1em}.katex .fontsize-ensurer.reset-size5.size6,.katex .sizing.reset-size5.size6{font-size:1.1111111111em}.katex .fontsize-ensurer.reset-size5.size7,.katex .sizing.reset-size5.size7{font-size:1.3333333333em}.katex .fontsize-ensurer.reset-size5.size8,.katex .sizing.reset-size5.size8{font-size:1.6em}.katex .fontsize-ensurer.reset-size5.size9,.katex .sizing.reset-size5.size9{font-size:1.92em}.katex .fontsize-ensurer.reset-size5.size10,.katex .sizing.reset-size5.size10{font-size:2.3044444444em}.katex .fontsize-ensurer.reset-size5.size11,.katex .sizing.reset-size5.size11{font-size:2.7644444444em}.katex .fontsize-ensurer.reset-size6.size1,.katex .sizing.reset-size6.size1{font-size:.5em}.katex .fontsize-ensurer.reset-size6.size2,.katex .sizing.reset-size6.size2{font-size:.6em}.katex .fontsize-ensurer.reset-size6.size3,.katex .sizing.reset-size6.size3{font-size:.7em}.katex .fontsize-ensurer.reset-size6.size4,.katex .sizing.reset-size6.size4{font-size:.8em}.katex .fontsize-ensurer.reset-size6.size5,.katex .sizing.reset-size6.size5{font-size:.9em}.katex .fontsize-ensurer.reset-size6.size6,.katex .sizing.reset-size6.size6{font-size:1em}.katex .fontsize-ensurer.reset-size6.size7,.katex .sizing.reset-size6.size7{font-size:1.2em}.katex .fontsize-ensurer.reset-size6.size8,.katex .sizing.reset-size6.size8{font-size:1.44em}.katex .fontsize-ensurer.reset-size6.size9,.katex .sizing.reset-size6.size9{font-size:1.728em}.katex .fontsize-ensurer.reset-size6.size10,.katex .sizing.reset-size6.size10{font-size:2.074em}.katex .fontsize-ensurer.reset-size6.size11,.katex .sizing.reset-size6.size11{font-size:2.488em}.katex .fontsize-ensurer.reset-size7.size1,.katex .sizing.reset-size7.size1{font-size:.4166666667em}.katex .fontsize-ensurer.reset-size7.size2,.katex .sizing.reset-size7.size2{font-size:.5em}.katex .fontsize-ensurer.reset-size7.size3,.katex .sizing.reset-size7.size3{font-size:.5833333333em}.katex .fontsize-ensurer.reset-size7.size4,.katex .sizing.reset-size7.size4{font-size:.6666666667em}.katex .fontsize-ensurer.reset-size7.size5,.katex .sizing.reset-size7.size5{font-size:.75em}.katex .fontsize-ensurer.reset-size7.size6,.katex .sizing.reset-size7.size6{font-size:.8333333333em}.katex .fontsize-ensurer.reset-size7.size7,.katex .sizing.reset-size7.size7{font-size:1em}.katex .fontsize-ensurer.reset-size7.size8,.katex .sizing.reset-size7.size8{font-size:1.2em}.katex .fontsize-ensurer.reset-size7.size9,.katex .sizing.reset-size7.size9{font-size:1.44em}.katex .fontsize-ensurer.reset-size7.size10,.katex .sizing.reset-size7.size10{font-size:1.7283333333em}.katex .fontsize-ensurer.reset-size7.size11,.katex .sizing.reset-size7.size11{font-size:2.0733333333em}.katex .fontsize-ensurer.reset-size8.size1,.katex .sizing.reset-size8.size1{font-size:.3472222222em}.katex .fontsize-ensurer.reset-size8.size2,.katex .sizing.reset-size8.size2{font-size:.4166666667em}.katex .fontsize-ensurer.reset-size8.size3,.katex .sizing.reset-size8.size3{font-size:.4861111111em}.katex .fontsize-ensurer.reset-size8.size4,.katex .sizing.reset-size8.size4{font-size:.5555555556em}.katex .fontsize-ensurer.reset-size8.size5,.katex .sizing.reset-size8.size5{font-size:.625em}.katex .fontsize-ensurer.reset-size8.size6,.katex .sizing.reset-size8.size6{font-size:.6944444444em}.katex .fontsize-ensurer.reset-size8.size7,.katex .sizing.reset-size8.size7{font-size:.8333333333em}.katex .fontsize-ensurer.reset-size8.size8,.katex .sizing.reset-size8.size8{font-size:1em}.katex .fontsize-ensurer.reset-size8.size9,.katex .sizing.reset-size8.size9{font-size:1.2em}.katex .fontsize-ensurer.reset-size8.size10,.katex .sizing.reset-size8.size10{font-size:1.4402777778em}.katex .fontsize-ensurer.reset-size8.size11,.katex .sizing.reset-size8.size11{font-size:1.7277777778em}.katex .fontsize-ensurer.reset-size9.size1,.katex .sizing.reset-size9.size1{font-size:.2893518519em}.katex .fontsize-ensurer.reset-size9.size2,.katex .sizing.reset-size9.size2{font-size:.3472222222em}.katex .fontsize-ensurer.reset-size9.size3,.katex .sizing.reset-size9.size3{font-size:.4050925926em}.katex .fontsize-ensurer.reset-size9.size4,.katex .sizing.reset-size9.size4{font-size:.462962963em}.katex .fontsize-ensurer.reset-size9.size5,.katex .sizing.reset-size9.size5{font-size:.5208333333em}.katex .fontsize-ensurer.reset-size9.size6,.katex .sizing.reset-size9.size6{font-size:.5787037037em}.katex .fontsize-ensurer.reset-size9.size7,.katex .sizing.reset-size9.size7{font-size:.6944444444em}.katex .fontsize-ensurer.reset-size9.size8,.katex .sizing.reset-size9.size8{font-size:.8333333333em}.katex .fontsize-ensurer.reset-size9.size9,.katex .sizing.reset-size9.size9{font-size:1em}.katex .fontsize-ensurer.reset-size9.size10,.katex .sizing.reset-size9.size10{font-size:1.2002314815em}.katex .fontsize-ensurer.reset-size9.size11,.katex .sizing.reset-size9.size11{font-size:1.4398148148em}.katex .fontsize-ensurer.reset-size10.size1,.katex .sizing.reset-size10.size1{font-size:.2410800386em}.katex .fontsize-ensurer.reset-size10.size2,.katex .sizing.reset-size10.size2{font-size:.2892960463em}.katex .fontsize-ensurer.reset-size10.size3,.katex .sizing.reset-size10.size3{font-size:.337512054em}.katex .fontsize-ensurer.reset-size10.size4,.katex .sizing.reset-size10.size4{font-size:.3857280617em}.katex .fontsize-ensurer.reset-size10.size5,.katex .sizing.reset-size10.size5{font-size:.4339440694em}.katex .fontsize-ensurer.reset-size10.size6,.katex .sizing.reset-size10.size6{font-size:.4821600771em}.katex .fontsize-ensurer.reset-size10.size7,.katex .sizing.reset-size10.size7{font-size:.5785920926em}.katex .fontsize-ensurer.reset-size10.size8,.katex .sizing.reset-size10.size8{font-size:.6943105111em}.katex .fontsize-ensurer.reset-size10.size9,.katex .sizing.reset-size10.size9{font-size:.8331726133em}.katex .fontsize-ensurer.reset-size10.size10,.katex .sizing.reset-size10.size10{font-size:1em}.katex .fontsize-ensurer.reset-size10.size11,.katex .sizing.reset-size10.size11{font-size:1.1996142719em}.katex .fontsize-ensurer.reset-size11.size1,.katex .sizing.reset-size11.size1{font-size:.2009646302em}.katex .fontsize-ensurer.reset-size11.size2,.katex .sizing.reset-size11.size2{font-size:.2411575563em}.katex .fontsize-ensurer.reset-size11.size3,.katex .sizing.reset-size11.size3{font-size:.2813504823em}.katex .fontsize-ensurer.reset-size11.size4,.katex .sizing.reset-size11.size4{font-size:.3215434084em}.katex .fontsize-ensurer.reset-size11.size5,.katex .sizing.reset-size11.size5{font-size:.3617363344em}.katex .fontsize-ensurer.reset-size11.size6,.katex .sizing.reset-size11.size6{font-size:.4019292605em}.katex .fontsize-ensurer.reset-size11.size7,.katex .sizing.reset-size11.size7{font-size:.4823151125em}.katex .fontsize-ensurer.reset-size11.size8,.katex .sizing.reset-size11.size8{font-size:.578778135em}.katex .fontsize-ensurer.reset-size11.size9,.katex .sizing.reset-size11.size9{font-size:.6945337621em}.katex .fontsize-ensurer.reset-size11.size10,.katex .sizing.reset-size11.size10{font-size:.8336012862em}.katex .fontsize-ensurer.reset-size11.size11,.katex .sizing.reset-size11.size11{font-size:1em}.katex .delimsizing.size1{font-family:KaTeX_Size1}.katex .delimsizing.size2{font-family:KaTeX_Size2}.katex .delimsizing.size3{font-family:KaTeX_Size3}.katex .delimsizing.size4{font-family:KaTeX_Size4}.katex .delimsizing.mult .delim-size1>span{font-family:KaTeX_Size1}.katex .delimsizing.mult .delim-size4>span{font-family:KaTeX_Size4}.katex .nulldelimiter{display:inline-block;width:.12em}.katex .delimcenter,.katex .op-symbol{position:relative}.katex .op-symbol.small-op{font-family:KaTeX_Size1}.katex .op-symbol.large-op{font-family:KaTeX_Size2}.katex .accent>.vlist-t,.katex .op-limits>.vlist-t{text-align:center}.katex .accent .accent-body{position:relative}.katex .accent .accent-body:not(.accent-full){width:0}.katex .overlay{display:block}.katex .mtable .vertical-separator{display:inline-block;min-width:1px}.katex .mtable .arraycolsep{display:inline-block}.katex .mtable .col-align-c>.vlist-t{text-align:center}.katex .mtable .col-align-l>.vlist-t{text-align:left}.katex .mtable .col-align-r>.vlist-t{text-align:right}.katex .svg-align{text-align:left}.katex svg{fill:currentColor;stroke:currentColor;fill-rule:nonzero;fill-opacity:1;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;display:block;height:inherit;position:absolute;width:100%}.katex svg path{stroke:none}.katex img{border-style:none;max-height:none;max-width:none;min-height:0;min-width:0}.katex .stretchy{display:block;overflow:hidden;position:relative;width:100%}.katex .stretchy:after,.katex .stretchy:before{content:""}.katex .hide-tail{overflow:hidden;position:relative;width:100%}.katex .halfarrow-left{left:0;overflow:hidden;position:absolute;width:50.2%}.katex .halfarrow-right{overflow:hidden;position:absolute;right:0;width:50.2%}.katex .brace-left{left:0;overflow:hidden;position:absolute;width:25.1%}.katex .brace-center{left:25%;overflow:hidden;position:absolute;width:50%}.katex .brace-right{overflow:hidden;position:absolute;right:0;width:25.1%}.katex .x-arrow-pad{padding:0 .5em}.katex .cd-arrow-pad{padding:0 .55556em 0 .27778em}.katex .mover,.katex .munder,.katex .x-arrow{text-align:center}.katex .boxpad{padding:0 .3em}.katex .fbox,.katex .fcolorbox{border:.04em solid;box-sizing:border-box}.katex .cancel-pad{padding:0 .2em}.katex .cancel-lap{margin-left:-.2em;margin-right:-.2em}.katex .sout{border-bottom-style:solid;border-bottom-width:.08em}.katex .angl{border-right:.049em solid;border-top:.049em solid;box-sizing:border-box;margin-right:.03889em}.katex .anglpad{padding:0 .03889em}.katex .eqn-num:before{content:"(" counter(katexEqnNo) ")";counter-increment:katexEqnNo}.katex .mml-eqn-num:before{content:"(" counter(mmlEqnNo) ")";counter-increment:mmlEqnNo}.katex .mtr-glue{width:50%}.katex .cd-vert-arrow{display:inline-block;position:relative}.katex .cd-label-left{display:inline-block;position:absolute;right:calc(50% + .3em);text-align:left}.katex .cd-label-right{display:inline-block;left:calc(50% + .3em);position:absolute;text-align:right}.katex-display{display:block;margin:1em 0;text-align:center}.katex-display>.katex{display:block;text-align:center;white-space:nowrap}.katex-display>.katex>.katex-html{display:block;position:relative}.katex-display>.katex>.katex-html>.tag{position:absolute;right:0}.katex-display.leqno>.katex>.katex-html>.tag{left:0;right:auto}.katex-display.fleqn>.katex{padding-left:2em;text-align:left}body{counter-reset:katexEqnNo mmlEqnNo}

		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; padding: 0; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); overflow-x: hidden; }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		.header { margin-bottom: 16px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.powered-by { margin: 4px 0 16px 0; line-height: 1.4; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0; }
		.package-link { color: var(--vscode-textLink-foreground); text-decoration: none; cursor: pointer; }
		.package-link:hover { text-decoration: underline; }
		.methods-list { list-style: none; padding-left: 0; margin: 5px 0; }
		.methods-list li { margin: 2px 0; padding-left: 20px; position: relative; }
		.methods-list li::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); }
		.form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
		.form-row { display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap; }
		.form-row .form-group { flex: 1; min-width: 100px; margin-bottom: 0; }
		.form-row .form-group.narrow { flex: 0 0 80px; min-width: 80px; }
		.form-row .form-group.wide { min-width: 160px; }
		.form-row .form-group.wider { min-width: 220px; }
		.form-label { font-size: 12px; font-weight: 500; margin-bottom: 6px; color: var(--vscode-foreground); }
		.form-label.centered { text-align: center; }
		.form-label-with-tooltip { position: relative; display: inline-flex; align-items: center; gap: 5px; }
		.tooltip-icon { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: var(--vscode-textLink-foreground); color: var(--vscode-editor-background); font-size: 10px; font-weight: bold; text-align: center; line-height: 14px; cursor: help; flex-shrink: 0; }
		.tooltip-icon.pinned { background-color: var(--vscode-charts-green); }
		.tooltip-text { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--vscode-widget-border); box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px; line-height: 1.4; white-space: normal; width: 320px; z-index: 1000; display: none; margin-bottom: 5px; }
		.form-label:not(.centered) .tooltip-text { left: 0; transform: none; }
		.tooltip-icon:hover + .tooltip-text, .tooltip-text:hover, .tooltip-text.pinned { display: block; }
		.form-input { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; outline: none; width: 100%; }
		.form-input:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		textarea.form-input { resize: none; overflow-x: auto; overflow-y: hidden; white-space: nowrap; height: 37px; line-height: 1.4; }
		textarea.form-input::-webkit-scrollbar { display: none; }
		.param-input { text-align: center; }
		.form-select { background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 8px 10px; font-size: 13px; font-family: var(--vscode-font-family); outline: none; width: 100%; cursor: pointer; height: 37px; }
		.form-select:focus { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		.code-preview-wrapper { position: relative; margin: 20px 0; }
		.code-preview { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 20px; padding-right: 50px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.6; overflow-x: auto; }
		.code-line { color: var(--vscode-foreground); margin: 4px 0; white-space: pre; }
		.code-blank { margin: 8px 0; }
		.code-comment { color: #6A9955; font-style: italic; }
		.hl-keyword { color: var(--vscode-symbolIcon-keywordForeground); }
		.hl-fn      { color: var(--vscode-textPreformat-foreground); }
		.hl-type    { color: var(--vscode-symbolIcon-classForeground); }
		.copy-btn { position: absolute; top: 8px; right: 8px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; opacity: 0.7; }
		.copy-btn:hover { opacity: 1; }
		.columns-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px; margin-top: 20px; }
		.columns-grid > div { display: flex; justify-content: center; }
		.column-inner { display: flex; flex-direction: column; }
		.column-title { font-size: 1.5em; font-weight: 400; color: var(--vscode-foreground); margin: 0 0 5px 0; line-height: initial; }
		.column-list { list-style: none; padding: 0; margin: 0; }
		.column-list li { margin: 0; }
		.list-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 3px 0; text-align: left; width: 100%; }
		.list-btn svg { flex-shrink: 0; }
		.list-btn:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		.list-btn.has-actions.was-pressed svg { color: var(--vscode-terminal-ansiBrightGreen); }
		.action-panel { margin-top: 20px; border-top: 1px solid var(--vscode-widget-border); padding-top: 16px; display: none; }
		.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
		.panel-title { font-size: 13px; font-weight: 600; }
		.panel-close { background: transparent; border: none; color: var(--vscode-descriptionForeground); font-size: 16px; line-height: 1; cursor: pointer; padding: 0 2px; }
		.panel-close:hover { color: var(--vscode-foreground); }
		.action-list { list-style: none; padding: 0; margin: 0; }
		.action-item { display: flex; flex-direction: column; align-items: flex-start; width: 100%; background: transparent; border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 8px 12px; margin-bottom: 6px; cursor: pointer; text-align: left; font-family: var(--vscode-font-family); }
		.action-item:hover { background: var(--vscode-list-hoverBackground); }
		.action-label { font-size: 13px; font-weight: 500; color: var(--vscode-textLink-foreground); }
		.action-desc { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 2px; }
		.eq-section { margin: 20px 0; border: 1px solid var(--vscode-widget-border); border-radius: 6px; overflow: hidden; }
		.eq-toggle { display: flex; align-items: center; justify-content: space-between; width: 100%; background: var(--vscode-textCodeBlock-background); border: none; color: var(--vscode-textLink-foreground); font-family: var(--vscode-font-family); font-size: 13px; font-weight: 600; padding: 10px 14px; cursor: pointer; text-align: left; }
		.eq-toggle:hover { text-decoration: underline; }
		.eq-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
		.eq-body { display: none; padding: 16px 20px; background: var(--vscode-editor-background); }
		.eq-body.open { display: block; }
		.eq-row { display: flex; align-items: baseline; gap: 12px; margin: 10px 0; }
		.eq-label { font-size: 11px; color: var(--vscode-descriptionForeground); min-width: 90px; flex-shrink: 0; }
		.eq-math { flex: 1; }
		.katex { font-size: 1.1em; }
	</style>
</head>
<body>
	<div class="container">

		<div class="header">
			<h1>Infinite-Dimensional Optimisation</h1>
			<div class="powered-by">Powered by: <span id="package-links"></span></div>
			<div class="subtitle">
				<ul class="methods-list">
					<li>Formulate optimisation problems over continuous domains: time, space, or any infinite parameter</li>
					<li>Supports ODE-constrained optimal control, integral objectives, and PDE-constrained problems</li>
					<li>Transcribes infinite problems to finite NLP/MIP via orthogonal collocation or trapezoid discretisation</li>
					<li>Compatible with any JuMP-supported solver: Ipopt, HiGHS, Juniper, GLPK, Mosek</li>
				</ul>
			</div>
		</div>

		<!-- Row 1: Optimizer, t0, T, N -->
		<div class="form-row">
			<div class="form-group wide">
				<label class="form-label centered form-label-with-tooltip">Optimizer
					<span class="tooltip-icon" id="tooltip-optimizer">?</span>
					<span class="tooltip-text" id="tooltip-text-optimizer"></span>
				</label>
				<select id="ido-optimizer" class="form-select">
					<option value="Ipopt">Ipopt</option>
					<option value="HiGHS">HiGHS</option>
					<option value="Juniper">Juniper</option>
					<option value="GLPK">GLPK</option>
					<option value="Mosek">Mosek</option>
				</select>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">t&#8320;
					<span class="tooltip-icon" id="tooltip-t0">?</span>
					<span class="tooltip-text" id="tooltip-text-t0"></span>
				</label>
				<textarea id="ido-t0" class="form-input param-input" placeholder="0" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">T
					<span class="tooltip-icon" id="tooltip-T">?</span>
					<span class="tooltip-text" id="tooltip-text-T"></span>
				</label>
				<textarea id="ido-T" class="form-input param-input" placeholder="10" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">Supports
					<span class="tooltip-icon" id="tooltip-N">?</span>
					<span class="tooltip-text" id="tooltip-text-N"></span>
				</label>
				<textarea id="ido-N" class="form-input param-input" placeholder="50" rows="1"></textarea>
			</div>
			<div class="form-group wide">
				<label class="form-label centered form-label-with-tooltip">Derivative Method
					<span class="tooltip-icon" id="tooltip-deriv">?</span>
					<span class="tooltip-text" id="tooltip-text-deriv"></span>
				</label>
				<select id="ido-deriv" class="form-select">
					<option value="OrthogonalCollocation(3)">Orthogonal Collocation (k=3)</option>
					<option value="OrthogonalCollocation(4)">Orthogonal Collocation (k=4)</option>
					<option value="Trapezoid()">Trapezoid</option>
					<option value="BSpline()">B-Spline</option>
				</select>
			</div>
		</div>

		<!-- Row 2: State vars, Control vars, Objective -->
		<div class="form-row">
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">States
					<span class="tooltip-icon" id="tooltip-n_x">?</span>
					<span class="tooltip-text" id="tooltip-text-n_x"></span>
				</label>
				<textarea id="ido-nx" class="form-input param-input" placeholder="1" rows="1"></textarea>
			</div>
			<div class="form-group narrow">
				<label class="form-label centered form-label-with-tooltip">Controls
					<span class="tooltip-icon" id="tooltip-n_u">?</span>
					<span class="tooltip-text" id="tooltip-text-n_u"></span>
				</label>
				<textarea id="ido-nu" class="form-input param-input" placeholder="1" rows="1"></textarea>
			</div>
			<div class="form-group wider">
				<label class="form-label centered form-label-with-tooltip">Objective integrand f(t, x, u)
					<span class="tooltip-icon" id="tooltip-objective">?</span>
					<span class="tooltip-text" id="tooltip-text-objective"></span>
				</label>
				<textarea id="ido-obj" class="form-input" placeholder="u^2" rows="1" style="text-align:center;"></textarea>
			</div>
		</div>

		<div class="code-preview-wrapper">
			<div class="code-preview" id="code-preview"></div>
			<button class="copy-btn" id="btn-copy">Copy</button>
		</div>

		<div class="eq-section">
			<button class="eq-toggle" id="eq-toggle">
				<span>Key Equations</span>
				<span class="eq-chevron" id="eq-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>
			</button>
			<div class="eq-body" id="eq-body">
				<div class="eq-row">
					<span class="eq-label">Objective</span>
					<div class="eq-math"><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><munder><mrow><mi>min</mi><mo>⁡</mo></mrow><mrow><mi>x</mi><mo stretchy="false">(</mo><mo>⋅</mo><mo stretchy="false">)</mo><mo separator="true">,</mo><mtext> </mtext><mi>u</mi><mo stretchy="false">(</mo><mo>⋅</mo><mo stretchy="false">)</mo></mrow></munder><mtext>  </mtext><msubsup><mo>∫</mo><msub><mi>t</mi><mn>0</mn></msub><mi>T</mi></msubsup><mi>f</mi><mo fence="true" stretchy="true" minsize="1.2em" maxsize="1.2em">(</mo><mi>t</mi><mo separator="true">,</mo><mi>x</mi><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo separator="true">,</mo><mi>u</mi><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo fence="true" stretchy="true" minsize="1.2em" maxsize="1.2em">)</mo><mtext> </mtext><mi>d</mi><mi>t</mi></mrow><annotation encoding="application/x-tex">\min_{x(\cdot),\,u(\cdot)}\;\int_{t_0}^{T} f\bigl(t,x(t),u(t)\bigr)\,dt</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:2.6033em;vertical-align:-1.012em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6679em;"><span style="top:-2.309em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">x</span><span class="mopen mtight">(</span><span class="mord mtight">⋅</span><span class="mclose mtight">)</span><span class="mpunct mtight">,</span><span class="mspace mtight" style="margin-right:0.1952em;"></span><span class="mord mathnormal mtight">u</span><span class="mopen mtight">(</span><span class="mord mtight">⋅</span><span class="mclose mtight">)</span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop">min</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.966em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop"><span class="mop op-symbol large-op" style="margin-right:0.44445em;position:relative;top:-0.0011em;">∫</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5912em;"><span style="top:-1.7881em;margin-left:-0.4445em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3173em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.8129em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.13889em;">T</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.012em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mopen"><span class="delimsizing size1">(</span></span><span class="mord mathnormal">t</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">x</span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">u</span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mclose"><span class="delimsizing size1">)</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">d</span><span class="mord mathnormal">t</span></span></span></span></span></div>
				</div>
				<div class="eq-row">
					<span class="eq-label">Dynamics</span>
					<div class="eq-math"><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mover accent="true"><mi>x</mi><mo>˙</mo></mover><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><mi>g</mi><mo fence="true" stretchy="true" minsize="1.2em" maxsize="1.2em">(</mo><mi>t</mi><mo separator="true">,</mo><mtext> </mtext><mi>x</mi><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo separator="true">,</mo><mtext> </mtext><mi>u</mi><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo fence="true" stretchy="true" minsize="1.2em" maxsize="1.2em">)</mo><mo separator="true">,</mo><mspace width="1em"/><mi>t</mi><mo>∈</mo><mo stretchy="false">[</mo><msub><mi>t</mi><mn>0</mn></msub><mo separator="true">,</mo><mi>T</mi><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">\dot{x}(t) = g\bigl(t,\,x(t),\,u(t)\bigr),\quad t\in[t_0,T]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6679em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">x</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">˙</span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2em;vertical-align:-0.35em;"></span><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mopen"><span class="delimsizing size1">(</span></span><span class="mord mathnormal">t</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">x</span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">u</span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mclose"><span class="delimsizing size1">)</span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.13889em;">T</span><span class="mclose">]</span></span></span></span></span></div>
				</div>
				<div class="eq-row">
					<span class="eq-label">Initial condition</span>
					<div class="eq-math"><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>x</mi><mo stretchy="false">(</mo><msub><mi>t</mi><mn>0</mn></msub><mo stretchy="false">)</mo><mo>=</mo><msub><mi>x</mi><mn>0</mn></msub></mrow><annotation encoding="application/x-tex">x(t_0) = x_0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">x</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span></div>
				</div>
				<div class="eq-row">
					<span class="eq-label">Collocation</span>
					<div class="eq-math"><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><munderover><mo>∑</mo><mrow><mi>j</mi><mo>=</mo><mn>0</mn></mrow><mi>k</mi></munderover><msub><mi>a</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mtext> </mtext><mi>x</mi><mo stretchy="false">(</mo><msub><mi>t</mi><mi>j</mi></msub><mo stretchy="false">)</mo><mo>=</mo><msub><mi>h</mi><mi>i</mi></msub><mtext> </mtext><mi>g</mi><mo fence="true" stretchy="true" minsize="1.2em" maxsize="1.2em">(</mo><msub><mi>t</mi><mi>i</mi></msub><mo separator="true">,</mo><mi>x</mi><mo stretchy="false">(</mo><msub><mi>t</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo separator="true">,</mo><mi>u</mi><mo stretchy="false">(</mo><msub><mi>t</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo fence="true" stretchy="true" minsize="1.2em" maxsize="1.2em">)</mo></mrow><annotation encoding="application/x-tex">\sum_{j=0}^{k} a_{ij}\,x(t_j) = h_i\,g\bigl(t_i,x(t_i),u(t_i)\bigr)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:3.2499em;vertical-align:-1.4138em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8361em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.05724em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">0</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.03148em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4138em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.05724em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">x</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.05724em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2em;vertical-align:-0.35em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mopen"><span class="delimsizing size1">(</span></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">x</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">u</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose"><span class="delimsizing size1">)</span></span></span></span></span></span></div>
				</div>
			</div>
		</div>

		<div class="columns-grid">
			<div>
				<div class="column-inner">
					<div class="column-title">Next Steps</div>
					<ul class="column-list">
						<li><button class="list-btn" id="btn-viz"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1.5 15H14.5C14.776 15 15 14.776 15 14.5C15 14.224 14.776 14 14.5 14H2V9.70799L5.00001 6.70798L6.64601 8.35398C6.84101 8.54898 7.15801 8.54898 7.35301 8.35398L11.499 4.20798L13.145 5.85398C13.34 6.04898 13.657 6.04898 13.852 5.85398C14.047 5.65898 14.047 5.34198 13.852 5.14698L11.852 3.14698C11.657 2.95198 11.34 2.95198 11.145 3.14698L6.99901 7.29298L5.35301 5.64698C5.15801 5.45198 4.84101 5.45198 4.64601 5.64698L2 8.29299V1.5C2 1.224 1.776 1 1.5 1C1.224 1 1 1.224 1 1.5V9.4848C0.999674 9.49525 0.999674 9.50571 1 9.51617V14.5C1 14.776 1.224 15 1.5 15Z"/></svg>Visualise</button></li>
						<li><button class="list-btn has-actions" id="btn-diagnose"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 0.998993C12.276 0.998993 12.5 1.22299 12.5 1.49899C12.5 1.77499 12.276 1.99899 12 1.99899H11.004V6.68299C11.004 7.26299 11.148 7.83299 11.423 8.34299L13.819 12.789C14.358 13.788 13.634 15.001 12.499 15.001H3.50101C2.36501 15.001 1.64301 13.788 2.18101 12.789L4.57501 8.34499C4.85001 7.83499 4.99401 7.26399 4.99401 6.68499V1.99899H4.00001C3.72401 1.99899 3.50001 1.77499 3.50001 1.49899C3.50001 1.22299 3.72401 0.998993 4.00001 0.998993H12ZM5.99401 1.99899V6.68599C5.99401 7.43099 5.80901 8.16399 5.45601 8.81999L4.82101 9.99899H11.18L10.543 8.81699C10.19 8.16099 10.005 7.42799 10.005 6.68199V1.99899H5.99401ZM11.718 10.999H4.28201L3.06201 13.263C2.88201 13.597 3.12401 14 3.50201 14H12.499C12.877 14 13.119 13.596 12.939 13.263L11.718 10.999Z"/></svg>Diagnose</button></li>
						<li><button class="list-btn" id="btn-predict"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M15 9.5V12.5C15 13.879 13.879 15 12.5 15H3.5C2.121 15 1 13.879 1 12.5V3.5C1 2.121 2.121 1 3.5 1H6.5C6.776 1 7 1.224 7 1.5C7 1.776 6.776 2 6.5 2H3.5C2.673 2 2 2.673 2 3.5V12.5C2 13.327 2.673 14 3.5 14H12.5C13.327 14 14 13.327 14 12.5V9.5C14 9.224 14.224 9 14.5 9C14.776 9 15 9.224 15 9.5ZM14.5 1H9.5C9.224 1 9 1.224 9 1.5C9 1.776 9.224 2 9.5 2H13.293L9.147 6.146C8.952 6.341 8.952 6.658 9.147 6.853C9.245 6.951 9.373 6.999 9.501 6.999C9.629 6.999 9.757 6.95 9.855 6.853L14.001 2.707V6.5C14.001 6.776 14.225 7 14.501 7C14.777 7 15.001 6.776 15.001 6.5V1.5C15.001 1.224 14.777 1 14.501 1H14.5Z"/></svg>Predict</button></li>
						<li><button class="list-btn" id="btn-compare"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M5.5 2H2.5C1.673 2 1 2.673 1 3.5V12.5C1 13.327 1.673 14 2.5 14H5.5C6.327 14 7 13.327 7 12.5V3.5C7 2.673 6.327 2 5.5 2ZM2.5 3H5.5C5.775 3 6 3.224 6 3.5V5H2V3.5C2 3.224 2.225 3 2.5 3ZM5.5 13H2.5C2.225 13 2 12.776 2 12.5V6H6V12.5C6 12.776 5.775 13 5.5 13ZM13.5 2H10.5C9.673 2 9 2.673 9 3.5V12.5C9 13.327 9.673 14 10.5 14H13.5C14.327 14 15 13.327 15 12.5V3.5C15 2.673 14.327 2 13.5 2ZM10.5 3H13.5C13.775 3 14 3.224 14 3.5V8H10V3.5C10 3.224 10.225 3 10.5 3ZM13.5 13H10.5C10.225 13 10 12.776 10 12.5V10H14V12.5C14 12.776 13.775 13 13.5 13Z"/></svg>Compare</button></li>
						<li><button class="list-btn has-actions" id="btn-interpret"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8.19905 2.782L8.96605 3.031L9.04905 3.061C9.04905 3.061 9.05405 3.063 9.05605 3.064C9.11905 3.089 9.18105 3.119 9.24005 3.152C9.36605 3.223 9.48105 3.311 9.58405 3.413C9.73805 3.566 9.85805 3.75 9.93605 3.952C9.94605 3.979 9.95605 4.006 9.96505 4.033L10.214 4.798C10.235 4.857 10.273 4.908 10.325 4.944C10.376 4.98 10.437 5 10.5 5H10.504C10.565 5 10.625 4.98 10.675 4.944C10.709 4.92 10.737 4.889 10.759 4.854C10.77 4.836 10.779 4.817 10.786 4.798L11.035 4.033C11.112 3.8 11.243 3.589 11.416 3.416C11.589 3.243 11.801 3.112 12.034 3.035L12.799 2.786C12.858 2.765 12.909 2.727 12.945 2.676C12.981 2.625 13.001 2.564 13.001 2.501C13.001 2.438 12.982 2.378 12.945 2.326C12.909 2.275 12.858 2.237 12.799 2.217L12.784 2.213L12.019 1.964C11.86 1.911 11.711 1.834 11.577 1.735C11.515 1.689 11.456 1.638 11.401 1.583C11.228 1.41 11.097 1.198 11.02 0.966L10.771 0.201C10.75 0.142 10.712 0.091 10.66 0.055C10.613 0.022 10.558 0.003 10.501 0H10.486C10.423 0 10.362 0.019 10.311 0.055C10.26 0.091 10.221 0.142 10.201 0.201L9.95205 0.966C9.87605 1.197 9.74805 1.407 9.57705 1.58C9.55205 1.605 9.52705 1.629 9.50105 1.652C9.34605 1.79 9.16505 1.896 8.96805 1.964L8.37305 2.157H8.37105L8.19905 2.212C8.14005 2.233 8.08905 2.272 8.05305 2.323C8.01705 2.374 7.99705 2.435 7.99705 2.498C7.99705 2.561 8.01705 2.622 8.05305 2.672C8.08905 2.723 8.14005 2.761 8.19905 2.782ZM11.62 7.538C11.609 7.503 11.588 7.468 11.558 7.439C11.528 7.41 11.493 7.388 11.455 7.375L11.341 7.337C11.279 7.544 11.199 7.746 11.102 7.941C10.86 8.425 10.518 8.851 10.098 9.192L9.99005 9.292L9.54105 11H6.49205L6.14305 9.536L6.04305 9.436C5.18305 8.706 4.63105 7.677 4.49805 6.556C4.51205 5.607 4.88505 4.699 5.54105 4.013C5.86205 3.688 6.24505 3.432 6.66705 3.258C6.82305 3.194 6.98305 3.141 7.14505 3.101C7.05005 2.921 6.99805 2.713 6.99805 2.497C6.99805 2.358 7.02005 2.223 7.06205 2.094C6.79605 2.15 6.53505 2.23 6.28205 2.335C5.73805 2.56 5.24505 2.892 4.83105 3.31C3.99305 4.18 3.51605 5.336 3.49805 6.544V6.582C3.62305 7.911 4.24305 9.144 5.23505 10.037L5.93505 12.978L5.94305 13C6.04105 13.289 6.22805 13.54 6.47705 13.717C6.73405 13.901 7.04305 14 7.36005 14H8.76405C9.07305 13.974 9.36605 13.854 9.60405 13.655C9.84305 13.456 10.012 13.185 10.085 12.882L10.885 9.832C11.33 9.443 11.697 8.975 11.968 8.452C11.91 8.365 11.862 8.27 11.827 8.169L11.62 7.538ZM9.11605 12.628V12.641C9.09405 12.735 9.04105 12.82 8.96605 12.881C8.89105 12.947 8.79705 12.988 8.69805 13H7.35905C7.25105 12.999 7.14605 12.964 7.05905 12.9C6.98705 12.85 6.93105 12.781 6.89805 12.7L6.73105 12H9.28005L9.11605 12.628ZM14.956 5.862C14.927 5.822 14.886 5.791 14.839 5.774L14.827 5.771L14.215 5.572V5.574C14.029 5.512 13.86 5.408 13.721 5.269C13.582 5.13 13.478 4.961 13.416 4.775L13.217 4.163C13.201 4.116 13.17 4.075 13.129 4.046C13.088 4.018 13.039 4.002 12.989 4.002C12.939 4.002 12.89 4.017 12.849 4.046C12.809 4.075 12.778 4.116 12.761 4.163L12.562 4.775C12.501 4.959 12.399 5.127 12.262 5.266C12.126 5.404 11.959 5.51 11.775 5.573L11.163 5.772C11.116 5.788 11.074 5.819 11.046 5.86C11.018 5.901 11.002 5.95 11.002 6C11.002 6.05 11.017 6.099 11.046 6.14C11.075 6.18 11.116 6.211 11.163 6.228L11.746 6.417V6.42L11.77 6.428C11.957 6.49 12.126 6.594 12.265 6.733C12.403 6.872 12.508 7.042 12.57 7.228L12.77 7.84C12.786 7.887 12.817 7.928 12.858 7.957C12.898 7.985 12.945 8.001 12.994 8.001H13.001C13.051 8.001 13.1 7.986 13.141 7.957C13.182 7.928 13.212 7.887 13.229 7.84L13.428 7.228C13.49 7.042 13.594 6.873 13.733 6.734C13.872 6.595 14.041 6.491 14.227 6.429L14.839 6.23C14.886 6.214 14.928 6.183 14.956 6.142C14.984 6.101 15 6.052 15 6.002C15 5.952 14.985 5.903 14.956 5.862Z"/></svg>Interpret</button></li>
					</ul>
				</div>
			</div>
			<div>
				<div class="column-inner">
					<div class="column-title">Learn More</div>
					<ul class="column-list">
						<li><button class="list-btn has-actions" id="btn-wiki"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2.5 2C1.67157 2 1 2.67157 1 3.5V12.5C1 13.3284 1.67157 14 2.5 14H6C6.8178 14 7.54389 13.6073 8 13.0002C8.45612 13.6073 9.1822 14 10 14H13.5C14.3284 14 15 13.3284 15 12.5V3.5C15 2.67157 14.3284 2 13.5 2H10C9.1822 2 8.45612 2.39267 8 2.99976C7.54389 2.39267 6.8178 2 6 2H2.5ZM7.5 4.5V11.5C7.5 12.3284 6.82843 13 6 13H2.5C2.22386 13 2 12.7761 2 12.5V3.5C2 3.22386 2.22386 3 2.5 3H6C6.82843 3 7.5 3.67157 7.5 4.5ZM8.5 11.5V4.5C8.5 3.67157 9.17157 3 10 3H13.5C13.7761 3 14 3.22386 14 3.5V12.5C14 12.7761 13.7761 13 13.5 13H10C9.17157 13 8.5 12.3284 8.5 11.5Z"/></svg>Local Wikis</button></li>
						<li><button class="list-btn has-actions" id="btn-notebook-tutorials"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M4.75 3C4.33579 3 4 3.33579 4 3.75V5.25C4 5.66421 4.33579 6 4.75 6H10.25C10.6642 6 11 5.66421 11 5.25V3.75C11 3.33579 10.6642 3 10.25 3H4.75ZM5 5V4H10V5H5ZM2 2.75C2 1.7835 2.7835 1 3.75 1H11.25C12.2165 1 13 1.7835 13 2.75V13.25C13 14.2165 12.2165 15 11.25 15H3.75C2.7835 15 2 14.2165 2 13.25V2.75ZM3.75 2C3.33579 2 3 2.33579 3 2.75V13.25C3 13.6642 3.33579 14 3.75 14H11.25C11.6642 14 12 13.6642 12 13.25V2.75C12 2.33579 11.6642 2 11.25 2H3.75ZM14.625 4H14V6H14.625C14.8321 6 15 5.83211 15 5.625V4.375C15 4.16789 14.8321 4 14.625 4ZM14 7H14.625C14.8321 7 15 7.16789 15 7.375V8.625C15 8.83211 14.8321 9 14.625 9H14V7ZM14.625 10H14V12H14.625C14.8321 12 15 11.8321 15 11.625V10.375C15 10.1679 14.8321 10 14.625 10Z"/></svg>Notebook Tutorials</button></li>
						<li><button class="list-btn" id="btn-documentation"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1C4.14 1 1 4.14 1 8C1 11.86 4.14 15 8 15C11.86 15 15 11.86 15 8C15 4.14 11.86 1 8 1ZM8 14C4.691 14 2 11.309 2 8C2 4.691 4.691 2 8 2C11.309 2 14 4.691 14 8C14 11.309 11.309 14 8 14ZM10.712 8C10.712 8.153 10.63 8.294 10.498 8.371L6.964 10.413C6.536 10.66 6 10.351 6 9.857V6.144C6 5.649 6.536 5.34 6.964 5.588L10.498 7.63C10.631 7.707 10.712 7.847 10.712 8Z"/></svg>Multimedia Tutorials</button></li>
						<li><button class="list-btn has-actions" id="btn-paper"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M9.49999 4H10.5C12.433 4 14 5.567 14 7.5C14 9.36856 12.5357 10.8951 10.6941 10.9948L10.5023 11L9.5023 11.0046C9.22616 11.0059 9.00127 10.783 8.99999 10.5069C8.99888 10.2614 9.17481 10.0565 9.40787 10.0131L9.4977 10.0046L10.5 10C11.8807 10 13 8.88071 13 7.5C13 6.17452 11.9685 5.08996 10.6644 5.00532L10.5 5H9.49999C9.22386 5 8.99999 4.77614 8.99999 4.5C8.99999 4.25454 9.17687 4.05039 9.41012 4.00806L9.49999 4H10.5H9.49999ZM5.5 4H6.5C6.77614 4 7 4.22386 7 4.5C7 4.74546 6.82312 4.94961 6.58988 4.99194L6.5 5H5.5C4.11929 5 3 6.11929 3 7.5C3 8.82548 4.03154 9.91004 5.33562 9.99468L5.5 10H6.5C6.77614 10 7 10.2239 7 10.5C7 10.7455 6.82312 10.9496 6.58988 10.9919L6.5 11H5.5C3.567 11 2 9.433 2 7.5C2 5.63144 3.46428 4.10487 5.30796 4.00518L5.5 4H6.5H5.5ZM5.50023 7L10.5002 7.0023C10.7764 7.00242 11.0001 7.22638 11 7.50252C10.9999 7.74798 10.8229 7.95205 10.5897 7.99428L10.4998 8.0023L5.49977 8C5.22363 7.99987 4.99987 7.77591 5 7.49977C5.00011 7.25431 5.17708 7.05024 5.41035 7.00801L5.50023 7Z"/></svg>References</button></li>
					</ul>
				</div>
			</div>
		</div>

		<div class="action-panel" id="action-panel"></div>

	</div>
	<script>
		const vscode = acquireVsCodeApi();
		var activeBtn = null;

		function v(id) {
			var el = document.getElementById(id);
			return el ? el.value.trim() : '';
		}

		function esc(s) {
			return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		}

		function kw(s)   { return '<span class="hl-keyword">' + s + '</span>'; }
		function fn(s)   { return '<span class="hl-fn">' + s + '</span>'; }
		function tp(s)   { return '<span class="hl-type">' + s + '</span>'; }
		function cmt(s)  { return '<span class="code-comment">' + s + '</span>'; }
		function line(s) { return '<div class="code-line">' + s + '</div>'; }
		function blank() { return '<div class="code-blank"></div>'; }

		function updateCodePreview() {
			var optimizer = (function() { var el = document.getElementById('ido-optimizer'); return el ? el.value : 'Ipopt'; })();
			var t0   = v('ido-t0')  || '0';
			var T    = v('ido-T')   || '10';
			var N    = v('ido-N')   || '50';
			var deriv = (function() { var el = document.getElementById('ido-deriv'); return el ? el.value : 'OrthogonalCollocation(3)'; })();
			var nx   = parseInt(v('ido-nx')) || 1;
			var nu   = parseInt(v('ido-nu')) || 1;
			var obj  = v('ido-obj') || 'u^2';

			var html = '';
			html += line(kw('using') + ' InfiniteOpt, ' + tp(optimizer));
			html += blank();
			html += line('model = ' + fn('InfiniteModel') + '()');
			html += blank();
			html += line(cmt('# Define infinite time parameter'));
			html += line(fn('@infinite_parameter') + '(model, t ' + kw('in') + ' [' + tp(t0) + ', ' + tp(T) + '], num_supports = ' + tp(N) + ',');
			html += line('                    derivative_method = ' + fn(deriv) + ')');
			html += blank();
			html += line(cmt('# State variable' + (nx > 1 ? 's' : '')));
			for (var i = 1; i <= nx; i++) {
				var xname = nx === 1 ? 'x' : 'x' + i;
				html += line(fn('@variable') + '(model, ' + xname + '(t))');
			}
			html += blank();
			html += line(cmt('# Control variable' + (nu > 1 ? 's' : '')));
			for (var j = 1; j <= nu; j++) {
				var uname = nu === 1 ? 'u' : 'u' + j;
				html += line(fn('@variable') + '(model, ' + uname + '(t))');
			}
			html += blank();
			html += line(cmt('# ODE dynamics (edit to match your system)'));
			var xn = nx === 1 ? 'x' : 'x1';
			var un = nu === 1 ? 'u' : 'u1';
			html += line(fn('@constraint') + '(model, ode, ' + fn('@deriv') + '(' + xn + ', t) == ' + xn + ' + ' + un + ')');
			html += blank();
			html += line(cmt('# Boundary conditions'));
			html += line(fn('@constraint') + '(model, ic, ' + xn + '(' + tp(t0) + ') == 0)');
			html += blank();
			html += line(cmt('# Objective: minimise integral of f(t, x, u) over [t0, T]'));
			html += line(fn('@objective') + '(model, ' + kw('Min') + ', ' + fn('integral') + '(' + esc(obj) + ', t))');
			html += blank();
			html += line(fn('set_optimizer') + '(model, ' + tp(optimizer) + '.' + fn('Optimizer') + ')');
			html += line(fn('optimize!') + '(model)');
			html += blank();
			html += line(cmt('# Retrieve results'));
			html += line(fn('println') + '(' + tp('"Status: "') + ', ' + fn('termination_status') + '(model))');
			html += line(fn('println') + '(' + tp('"Objective: "') + ', ' + fn('objective_value') + '(model))');
			if (nx <= 3) {
				for (var k = 1; k <= nx; k++) {
					var xk = nx === 1 ? 'x' : 'x' + k;
					html += line(fn('supports') + '(t), ' + fn('value') + '(' + xk + ')  ' + cmt('# optimal state trajectory'));
				}
			}

			document.getElementById('code-preview').innerHTML = html;
		}

		document.querySelectorAll('textarea.form-input, select.form-select').forEach(function(el) {
			el.addEventListener('input', updateCodePreview);
			el.addEventListener('keydown', function(e) {
				e.stopPropagation();
				if (e.key === 'Enter') { e.preventDefault(); updateCodePreview(); }
			});
		});

		document.getElementById('btn-copy').addEventListener('click', function() {
			var lines = document.getElementById('code-preview').querySelectorAll('.code-line, .code-blank');
			var text = Array.from(lines).map(function(l) { return l.textContent || ''; }).join('\\n');
			navigator.clipboard.writeText(text).then(function() {
				var btn = document.getElementById('btn-copy');
				btn.textContent = 'Copied!';
				setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
			});
		});

		var DIAGNOSE_ACTIONS = [
			{ label: 'Convergence Check',     desc: 'Inspect termination_status(model) and primal/dual feasibility tolerances' },
			{ label: 'Constraint Violations', desc: 'Evaluate constraint residuals at all supports to verify ODE and boundary conditions are satisfied' },
			{ label: 'Support Density',       desc: 'Plot the distribution of collocation supports over [t0, T] and check for clustering' },
		];

		var INTERPRET_ACTIONS = [
			{ label: 'Optimal Trajectory',  desc: 'Plot state and control trajectories x(t), u(t) at the optimal solution' },
			{ label: 'Dual Variables',      desc: 'Inspect shadow prices (dual_value) on ODE and boundary constraints to understand active constraints' },
			{ label: 'Sensitivity Analysis', desc: 'Perturb T, N, or boundary conditions and observe changes in the optimal objective value' },
		];

		function buildActionPanel(title, actions) {
			var html = '<div class="panel-header"><span class="panel-title">' + esc(title) + '</span><button class="panel-close" id="panel-close">&times;</button></div>';
			html += '<ul class="action-list">';
			actions.forEach(function(a) {
				html += '<li><button class="action-item"><span class="action-label">' + esc(a.label) + '</span><span class="action-desc">' + a.desc + '</span></button></li>';
			});
			html += '</ul>';
			var panel = document.getElementById('action-panel');
			panel.innerHTML = html;
			panel.style.display = 'block';
			document.getElementById('panel-close').addEventListener('click', function() {
				panel.style.display = 'none';
				if (activeBtn) { activeBtn.classList.remove('was-pressed'); activeBtn = null; }
			});
		}

		function attachActionBtn(id, title, actions) {
			var btn = document.getElementById(id);
			if (!btn) { return; }
			btn.addEventListener('click', function() {
				if (activeBtn && activeBtn !== btn) { activeBtn.classList.remove('was-pressed'); }
				activeBtn = btn;
				btn.classList.add('was-pressed');
				buildActionPanel(title, actions);
			});
		}

		attachActionBtn('btn-diagnose',  'Diagnose',  DIAGNOSE_ACTIONS);
		attachActionBtn('btn-interpret', 'Interpret', INTERPRET_ACTIONS);

		['btn-viz', 'btn-predict', 'btn-compare'].forEach(function(id) {
			var btn = document.getElementById(id);
			if (btn) {
				btn.addEventListener('click', function() {
					document.getElementById('action-panel').style.display = 'none';
					if (activeBtn) { activeBtn.classList.remove('was-pressed'); }
					activeBtn = null;
				});
			}
		});

		document.getElementById('btn-wiki').addEventListener('click', function() {
			if (activeBtn) { activeBtn.classList.remove('was-pressed'); }
			activeBtn = this; this.classList.add('was-pressed');
			vscode.postMessage({ command: 'openDocs', target: 'wiki' });
		});
		document.getElementById('btn-paper').addEventListener('click', function() {
			if (activeBtn) { activeBtn.classList.remove('was-pressed'); }
			activeBtn = this; this.classList.add('was-pressed');
			vscode.postMessage({ command: 'openDocs', target: 'paper' });
		});
		document.getElementById('btn-notebook-tutorials').addEventListener('click', function() {
			if (activeBtn) { activeBtn.classList.remove('was-pressed'); }
			activeBtn = this; this.classList.add('was-pressed');
			vscode.postMessage({ command: 'openNotebookList' });
		});
		document.getElementById('btn-documentation').addEventListener('click', function() {
			vscode.postMessage({ command: 'openUrl', url: 'https://github.com/infiniteopt/InfiniteOpt.jl' });
		});

		document.querySelectorAll('.tooltip-icon').forEach(function(icon) {
			icon.addEventListener('click', function(e) {
				e.stopPropagation();
				var tip = this.nextElementSibling;
				if (tip && tip.classList.contains('tooltip-text')) {
					var wasPinned = tip.classList.contains('pinned');
					tip.classList.toggle('pinned');
					this.classList.toggle('pinned');
					if (wasPinned) {
						tip.style.display = 'none';
						this.addEventListener('mouseleave', function() { tip.style.display = ''; }, { once: true });
					}
				}
			});
		});

		window.addEventListener('message', function(event) {
			var msg = event.data;
			switch (msg.command) {
				case 'packageLinks': {
					var el = document.getElementById('package-links');
					if (el && msg.packages) {
						el.innerHTML = msg.packages.map(function(p) {
							return '<a class="package-link" href="#" data-url="' + esc(p.url) + '">' + esc(p.name) + '</a>';
						}).join(', ');
						el.querySelectorAll('.package-link').forEach(function(a) {
							a.addEventListener('click', function(e) {
								e.preventDefault();
								vscode.postMessage({ command: 'openUrl', url: this.getAttribute('data-url') });
							});
						});
					}
					break;
				}
				case 'tooltips': {
					if (msg.tooltips) {
						Object.keys(msg.tooltips).forEach(function(key) {
							var el = document.getElementById('tooltip-text-' + key);
							if (el) { el.textContent = msg.tooltips[key]; }
						});
					}
					break;
				}
				case 'actionDone': {
					if (activeBtn) { activeBtn.classList.remove('was-pressed'); activeBtn = null; }
					break;
				}
			}
		});

		updateCodePreview();

		var katexRendered = false;

		function renderKatex() {
			if (katexRendered) { return; }
			katexRendered = true;
			var opts = { throwOnError: false, displayMode: true };
			katex.render('\\\\min_{x(\\\\cdot),\\\\,u(\\\\cdot)}\\\\;\\\\int_{t_0}^{T} f\\\\bigl(t,\\\\,x(t),\\\\,u(t)\\\\bigr)\\\\,dt', document.getElementById('eq-obj'), opts);
			katex.render('\\\\dot{x}(t) = g\\\\bigl(t,\\\\,x(t),\\\\,u(t)\\\\bigr), \\\\quad t\\\\in[t_0,\\\\,T]', document.getElementById('eq-dyn'), opts);
			katex.render('x(t_0) = x_0', document.getElementById('eq-ic'), opts);
			katex.render('\\\\sum_{j=0}^{k} a_{ij}\\\\,x(t_j) = h_i\\\\,g\\\\bigl(t_i,\\\\,x(t_i),\\\\,u(t_i)\\\\bigr)', document.getElementById('eq-coll'), opts);
		}

		document.getElementById('eq-toggle').addEventListener('click', function() {
			var body = document.getElementById('eq-body');
			var chevron = document.getElementById('eq-chevron');
			var isOpen = body.classList.toggle('open');
			chevron.style.transform = isOpen ? '' : 'rotate(-90deg)';
			if (isOpen) { renderKatex(); }
		});
	</script>
</body>
</html>`;
}
