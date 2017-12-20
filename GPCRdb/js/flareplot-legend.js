function createLegend(data, containerSelector) {

    if( typeof data == "string" ){
        data = JSON.parse(data);
    }

    var interactions = data.interactions;
    var segment_map = data.segment_map;
    var sequence_numbers = data.sequence_numbers;
    var aa_map = data.aa_map[Object.keys(data.aa_map)[0]];
    var gen_map = data.generic_map;
    var num_seq_numbers = Object.keys(data.sequence_numbers).length;


    // Populatflareplot legend
    var interactionTypes = new Set();
    
    $(containerSelector + ' .flareplot-interaction').each(function() {
        var friendlyName = getFriendlyInteractionName($(this).data('interaction-type'));
        interactionTypes.add(friendlyName);
    });


    // Add interactions color legend
    var legendHtml = '<ul>';
    
    interactionTypes = Array.from(interactionTypes).sort(function (i1, i2) {
        return getInteractionStrength(i2) - getInteractionStrength(i1);
    });

    interactionTypes.forEach(function(i) {
        var rgb = getInteractionColor(i);
        legendHtml = legendHtml
                + '<li>'
                + '<div class="color-box" style="background-color: ' + rgb2hex(rgb.r, rgb.g, rgb.b) + '">' + '<input type="checkbox" data-interaction-type="' + i.replace(/ /g,"-") +'"></input>' + '</div><p>' + i + '</p>'
                + '</li>';
    });
    legendHtml += '</ul>';

    // Add SVG download button
    legendHtml += '<button onclick="downloadSVG(\'' + containerSelector + 'flareplot\', \'interactions.svg\')" type="button" class="btn btn-primary pull-right svg-download-button" aria-label="Left Align">' +
                    '<span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download SVG' +
                '</button>';

    // Add CSV download button
    legendHtml += '<br /><button onclick="downloadSingleCrystalCSV(\'' + containerSelector + 'flareplot\', \'interactions.csv\')" type="button" class="btn btn-success pull-right csv-download-button" aria-label="Left Align"><span class="glyphicon glyphicon-download" aria-hidden="true"></span> Download CSV' +
    '</button>';

    $(containerSelector + ' .flareplot-legend').append(legendHtml);


    $(containerSelector + ' .flareplot-legend input[type=checkbox]').each(function() {
        $(this).prop('checked', true);
        $(this).change(function() {
            var interactionType = $(this).data('interaction-type');

            console.log(interactionType)
            var paths = $(containerSelector + ' path.' + interactionType);
            if ($(this).is(':checked')) {
                paths.show();
            } else {
                paths.hide();
            }
        });
    });
}


function hidePopovers() {
    $('.popover').each(function(){
        $(this).popover('hide');
    });
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function rgb2hex(r,g,b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length == 1)
        r = '0' + r;

    if (g.length == 1)
        g = '0' + g;

    if (b.length == 1)
        b = '0' + b;

    return '#' + r + g + b;
}

function getInteractionStrength(i) {
    switch (i) { 
        case getFriendlyInteractionName('polarsidechainsidechaininteraction'):
        case getFriendlyInteractionName('polarbackbonesidechaininteraction'):
        case'polarsidechainsidechaininteraction':
        case'polarbackbonesidechaininteraction':
            return 4;
        case getFriendlyInteractionName('facetofaceinteraction'):
        case getFriendlyInteractionName('facetoedgeinteraction'):
        case getFriendlyInteractionName('picationinteraction'):
        case'facetofaceinteraction':
        case'facetoedgeinteraction':
        case'picationinteraction':
            return 3;
        case getFriendlyInteractionName('hydrophobicinteraction'):
        case'hydrophobicinteraction':
            return 2;
        case getFriendlyInteractionName('vanderwaalsinteraction'):
        case'vanderwaalsinteraction':
            return 1;
        default:
            return 0;
    }
}


function getStrongestInteractionType(interactions) {

    if ($.inArray('polarsidechainsidechaininteraction', interactions) > -1)
        return 'polarsidechainsidechaininteraction';

    if ($.inArray('polarbackbonesidechaininteraction', interactions) > -1)
        return 'polarbackbonesidechaininteraction';

    if ($.inArray('facetofaceinteraction', interactions) > -1)
        return 'facetofaceinteraction';

    if ($.inArray('facetoedgeinteraction', interactions) > -1)
        return 'facetoedgeinteraction';

    if ($.inArray('picationinteraction', interactions) > -1)
        return 'picationinteraction';

    if ($.inArray('hydrophobicinteraction', interactions) > -1)
        return 'hydrophobicinteraction';

    if ($.inArray('vanderwaalsinteraction', interactions) > -1)
        return 'vanderwaalsinteraction';

    return 'undefined';
}

function getStrongestInteractionTypeFromPdbObject(obj) {

    var interactions = [];

    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            var strongestInteraction = getStrongestInteractionType(obj[key]);
            interactions.push(strongestInteraction);
        }
    }

    return getStrongestInteractionType(interactions);
}

function getInteractionTypesFromPdbObject(obj) {

    var interactions = new Set();

    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            for (var k in obj[key])
                interactions.add(obj[key][k]);
        }
    }

    // Sort according to strength
    interactions = Array.from(interactions);
    interactions.sort(function (i1, i2) {
        return  getInteractionStrength(i1) - getInteractionStrength(i2);
    });

    return interactions;
}


function getInteractionColor(interaction) {

    var r, g, b;

    switch (interaction) {
        case 'polarsidechainsidechaininteraction':
        case 'polarbackbonesidechaininteraction':
        case getFriendlyInteractionName('polarsidechainsidechaininteraction'):
        case getFriendlyInteractionName('polarbackbonesidechaininteraction'):
            r = 254; g = 0; b = 16;
            break;
        case 'facetofaceinteraction':
        case 'facetoedgeinteraction':
        case 'picationinteraction':
        case getFriendlyInteractionName('facetofaceinteraction'):
        case getFriendlyInteractionName('facetoedgeinteraction'):
        case getFriendlyInteractionName('picationinteraction'):
            r = 94; g = 241; b = 242;
            break;
        case 'hydrophobicinteraction':
        case getFriendlyInteractionName('hydrophobicinteraction'):
            r = 0; g = 117; b = 220;
            break;
        case 'vanderwaalsinteraction':
        case getFriendlyInteractionName('vanderwaalsinteraction'):
            r = 89; g = 252; b = 197;
            break;
        default:
            r = 0; g = 0; b = 0;
    }

    return { r: r, g: g, b: b };
}

function getFriendlyInteractionName(interaction) {
    switch (interaction) {
        case 'polarsidechainsidechaininteraction':
        case 'polarbackbonesidechaininteraction':
            return 'Polar';
        case 'facetofaceinteraction':
        case 'facetoedgeinteraction':
        case 'picationinteraction':
            return 'Aromatic';
        case 'hydrophobicinteraction':
            return 'Hydrophobic';
        case 'vanderwaalsinteraction':
            return 'Van der Waals';
        default:
            return 'Unknown';
    }
}

function getSegmentColor(segmentName) {
    var r, g, b;

    switch (segmentName) {
        case 'N-term':
        case 'C-term':
            r = 190; g = 190; b = 190;
            //r = 255; g = 150; b = 150;
            break;
        case 'TM1':
        case 'TM2':
        case 'TM3':
        case 'TM4':
        case 'TM5':
        case 'TM6':
        case 'TM7':
        case 'H8':
            r = 230; g = 230; b = 230;
            //r = 150; g = 255; b = 150;
            break;
        case 'ECL1':
        case 'ECL2':
        case 'ECL3':
            r = 190; g = 190; b = 190;
            //r = 150; g = 150; b = 255;
            break;
        case 'ICL1':
        case 'ICL2':
        case 'ICL3':
            r = 190; g = 190; b = 190;
            //r = 150; g = 150; b = 255;
            break;
        default:
            r = 0; g = 0; b = 0;
    }

    return { r: r, g: g, b: b };
}

function getAminoAcidOneLetterCode(threeLetterCode) {
    switch (threeLetterCode.toUpperCase()) {
        case 'ALA': 
            return 'A'; 
        case 'ARG': 
            return 'R'; 
        case 'ASN': 
            return 'N'; 
        case 'ASP': 
            return 'D';
        case 'CYS': 
            return 'C'; 
        case 'GLN': 
            return 'Q'; 
        case 'GLU': 
            return 'E'; 
        case 'GLY': 
            return 'G';
        case 'HIS': 
            return 'H'; 
        case 'ILE': 
            return 'I'; 
        case 'LEU': 
            return 'L'; 
        case 'LYS': 
            return 'K';
        case 'MET': 
            return 'M'; 
        case 'PHE': 
            return 'F'; 
        case 'PRO': 
            return 'P'; 
        case 'SER': 
            return 'S';
        case 'THR': 
            return 'T'; 
        case 'TRP': 
            return 'W'; 
        case 'TYR': 
            return 'Y'; 
        case 'VAL': 
            return 'V';
        default:
            return null;
    }
}

function downloadSVG(svgSelector, name) {
  var svgClone = $(svgSelector).clone();
  svgClone.find('.svg-pan-zoom_viewport').attr('transform', 'matrix(2.2,0,0,2.2,295,140)');
  
  var escapedSVG = new XMLSerializer().serializeToString(svgClone.get(0));

  downloadURI('data:image/svg+xml;base64,' + window.btoa(escapedSVG), name);
}