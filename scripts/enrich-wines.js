/**
 * Wine Enrichment Script
 * Parses wine names to extract grape, region, country, color, and generates descriptions.
 * Run: node scripts/enrich-wines.js
 */

const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('app/stock_24-03-2026.xlsx');
const ws = wb.Sheets['Stock'];
const data = XLSX.utils.sheet_to_json(ws);
const inStock = data.filter(r => r['Quantité'] > 0);

// ─── GRAPE VARIETY DATABASE ───
const GRAPE_PATTERNS = {
  // White grapes
  'riesling': { grape: 'Riesling', color: 'white' },
  'chardonnay': { grape: 'Chardonnay', color: 'white' },
  'sauvignon': { grape: 'Sauvignon Blanc', color: 'white' },
  'pinot gris': { grape: 'Pinot Gris', color: 'white' },
  'pinot blanc': { grape: 'Pinot Blanc', color: 'white' },
  'grauburgunder': { grape: 'Pinot Gris', color: 'white' },
  'weißburgunder': { grape: 'Pinot Blanc', color: 'white' },
  'weissburgunder': { grape: 'Pinot Blanc', color: 'white' },
  'gewürztraminer': { grape: 'Gewürztraminer', color: 'white' },
  'gewurztraminer': { grape: 'Gewürztraminer', color: 'white' },
  'sylvaner': { grape: 'Sylvaner', color: 'white' },
  'muscadet': { grape: 'Melon de Bourgogne', color: 'white' },
  'viognier': { grape: 'Viognier', color: 'white' },
  'marsanne': { grape: 'Marsanne', color: 'white' },
  'roussanne': { grape: 'Roussanne', color: 'white' },
  'vermentino': { grape: 'Vermentino', color: 'white' },
  'trebbiano': { grape: 'Trebbiano', color: 'white' },
  'albariño': { grape: 'Albariño', color: 'white' },
  'albarino': { grape: 'Albariño', color: 'white' },
  'grüner veltliner': { grape: 'Grüner Veltliner', color: 'white' },
  'gruner veltliner': { grape: 'Grüner Veltliner', color: 'white' },
  'müller-thurgau': { grape: 'Müller-Thurgau', color: 'white' },
  'muller-thurgau': { grape: 'Müller-Thurgau', color: 'white' },
  'rivaner': { grape: 'Rivaner', color: 'white' },
  'auxerrois': { grape: 'Auxerrois', color: 'white' },
  'elbling': { grape: 'Elbling', color: 'white' },
  'chenin': { grape: 'Chenin Blanc', color: 'white' },
  'melon de bourgogne': { grape: 'Melon de Bourgogne', color: 'white' },
  'furmint': { grape: 'Furmint', color: 'white' },
  'olaszrizling': { grape: 'Olaszrizling', color: 'white' },
  'juhfark': { grape: 'Juhfark', color: 'white' },
  'ezerjó': { grape: 'Ezerjó', color: 'white' },
  'ezerjo': { grape: 'Ezerjó', color: 'white' },
  'muscaris': { grape: 'Muscaris', color: 'white' },
  'godello': { grape: 'Godello', color: 'white' },
  'macabeo': { grape: 'Macabeo', color: 'white' },
  'xarel·lo': { grape: 'Xarel·lo', color: 'white' },
  'xarello': { grape: 'Xarel·lo', color: 'white' },
  'rebula': { grape: 'Rebula', color: 'white' },
  'jakot': { grape: 'Jakot (Friulano)', color: 'white' },
  'malvasia': { grape: 'Malvasia', color: 'white' },
  'apremont': { grape: 'Jacquère', color: 'white' },
  'jacquère': { grape: 'Jacquère', color: 'white' },
  'savagnin': { grape: 'Savagnin', color: 'white' },

  // Red grapes
  'pinot noir': { grape: 'Pinot Noir', color: 'red' },
  'cabernet sauvignon': { grape: 'Cabernet Sauvignon', color: 'red' },
  'cabernet franc': { grape: 'Cabernet Franc', color: 'red' },
  'merlot': { grape: 'Merlot', color: 'red' },
  'syrah': { grape: 'Syrah', color: 'red' },
  'shiraz': { grape: 'Syrah', color: 'red' },
  'grenache': { grape: 'Grenache', color: 'red' },
  'garnacha': { grape: 'Grenache', color: 'red' },
  'mourvèdre': { grape: 'Mourvèdre', color: 'red' },
  'mourvedre': { grape: 'Mourvèdre', color: 'red' },
  'carignan': { grape: 'Carignan', color: 'red' },
  'malbec': { grape: 'Malbec', color: 'red' },
  'gamay': { grape: 'Gamay', color: 'red' },
  'tempranillo': { grape: 'Tempranillo', color: 'red' },
  'sangiovese': { grape: 'Sangiovese', color: 'red' },
  'montepulciano': { grape: 'Montepulciano', color: 'red' },
  'nebbiolo': { grape: 'Nebbiolo', color: 'red' },
  'barbera': { grape: 'Barbera', color: 'red' },
  'blaufränkisch': { grape: 'Blaufränkisch', color: 'red' },
  'blaufrankisch': { grape: 'Blaufränkisch', color: 'red' },
  'zweigelt': { grape: 'Zweigelt', color: 'red' },
  'tannat': { grape: 'Tannat', color: 'red' },
  'mencia': { grape: 'Mencía', color: 'red' },
  'poulsard': { grape: 'Poulsard', color: 'red' },
  'trousseau': { grape: 'Trousseau', color: 'red' },
  'cinsault': { grape: 'Cinsault', color: 'red' },
  'négrette': { grape: 'Négrette', color: 'red' },
  'negrette': { grape: 'Négrette', color: 'red' },
  'fer servadou': { grape: 'Fer Servadou', color: 'red' },
  'duras': { grape: 'Duras', color: 'red' },
  'saint-laurent': { grape: 'Saint-Laurent', color: 'red' },
};

// ─── PRODUCER DATABASE (manually curated from the wine list) ───
const PRODUCERS = {
  // Italy
  'controvento': { country: 'Italy', region: 'Abruzzo' },
  'dalle ore': { country: 'Italy', region: 'Veneto' },
  'nando': { country: 'Italy', region: 'Friuli' },
  'podere ortica': { country: 'Italy', region: 'Toscana' },
  'petracavall': { country: 'Italy', region: 'Puglia' },
  'conestabile della staffa': { country: 'Italy', region: 'Umbria' },
  'pupo punk': { country: 'Italy', region: 'Campania' },
  'tenuta nardone': { country: 'Italy', region: 'Campania' },
  'don giovanni': { country: 'Italy', region: 'Abruzzo' },
  'sensodivino': { country: 'Italy', region: 'Abruzzo' },
  'vitalba': { country: 'Italy', region: 'Emilia-Romagna' },
  'sono': { country: 'Italy', region: 'Emilia-Romagna' },
  'cantina ferraro': { country: 'Italy', region: 'Campania' },

  // Spain
  'bhilar': { country: 'Spain', region: 'Rioja' },
  'phinca': { country: 'Spain', region: 'Rioja' },
  'llopart': { country: 'Spain', region: 'Penedès' },
  'els vinyerons': { country: 'Spain', region: 'Penedès' },
  'amós bañeres': { country: 'Spain', region: 'Penedès' },
  'amos baneres': { country: 'Spain', region: 'Penedès' },
  'coca i fito': { country: 'Spain', region: 'Montsant' },
  'ultreia': { country: 'Spain', region: 'Bierzo' },
  'equanim': { country: 'Spain', region: 'Montsant' },
  'unanim': { country: 'Spain', region: 'Montsant' },
  'turbulent': { country: 'Spain', region: 'Montsant' },

  // Austria
  'koppitsch': { country: 'Austria', region: 'Burgenland' },
  'altenburger': { country: 'Austria', region: 'Burgenland' },
  'elias muster': { country: 'Austria', region: 'Steiermark' },
  'grassl': { country: 'Austria', region: 'Carnuntum' },
  'steigler': { country: 'Austria', region: 'Sopron' },

  // Germany
  'gustavshof': { country: 'Germany', region: 'Rheinhessen' },
  'gustavhof': { country: 'Germany', region: 'Rheinhessen' },
  'derringer': { country: 'Germany', region: 'Pfalz' },
  'vetter': { country: 'Germany', region: 'Baden' },
  'lissner': { country: 'France', region: 'Alsace' },
  'brand': { country: 'France', region: 'Alsace' },

  // France - Loire
  'domaine bellivière': { country: 'France', region: 'Loire' },
  'domaine de l\'ecu': { country: 'France', region: 'Loire' },
  'domaine de l\'écu': { country: 'France', region: 'Loire' },
  'domaine aux moines': { country: 'France', region: 'Loire' },
  'domaine alexandre bain': { country: 'France', region: 'Loire' },
  'domaine les poëte': { country: 'France', region: 'Loire' },
  'hardy jb': { country: 'France', region: 'Loire' },
  'simon batardière': { country: 'France', region: 'Loire' },
  'clos du plessis': { country: 'France', region: 'Loire' },
  'domaine sébastien brunet': { country: 'France', region: 'Loire' },
  'wilfried crochet': { country: 'France', region: 'Loire' },
  'domaine françois chidaine': { country: 'France', region: 'Loire' },

  // France - Bourgogne
  'julien guillon': { country: 'France', region: 'Bourgogne' },
  'gilles ballorin': { country: 'France', region: 'Bourgogne' },
  'maison romane': { country: 'France', region: 'Bourgogne' },
  'closeries des moussis': { country: 'France', region: 'Bourgogne' },
  'jessica litaud': { country: 'France', region: 'Bourgogne' },
  'garcia nuits': { country: 'France', region: 'Bourgogne' },
  'cossard': { country: 'France', region: 'Bourgogne' },
  'simon bize': { country: 'France', region: 'Bourgogne' },
  'sauzet': { country: 'France', region: 'Bourgogne' },
  'paul pillot': { country: 'France', region: 'Bourgogne' },
  'puy de l\'ours': { country: 'France', region: 'Bourgogne' },
  'vallee moray': { country: 'France', region: 'Bourgogne' },
  'clos bateau': { country: 'France', region: 'Bourgogne' },

  // France - Beaujolais
  'sunier': { country: 'France', region: 'Beaujolais' },
  'maison bruyere': { country: 'France', region: 'Beaujolais' },
  'domaine des 4 vents': { country: 'France', region: 'Beaujolais' },
  'domaine des côtes rouges': { country: 'France', region: 'Beaujolais' },

  // France - Rhône
  'rapatel': { country: 'France', region: 'Rhône' },
  'domaine gramenon': { country: 'France', region: 'Rhône' },
  'stéphane cyran': { country: 'France', region: 'Rhône' },
  'maison stephan': { country: 'France', region: 'Rhône' },
  'nans perrier': { country: 'France', region: 'Rhône' },
  'romain le bars': { country: 'France', region: 'Rhône' },
  'daniel sage': { country: 'France', region: 'Rhône' },
  'porte jean': { country: 'France', region: 'Rhône' },
  'l\'avarice': { country: 'France', region: 'Rhône' },
  'david reynaud': { country: 'France', region: 'Rhône' },

  // France - Jura
  'marnes blanches': { country: 'France', region: 'Jura' },
  'marne blanche': { country: 'France', region: 'Jura' },
  'domaine bornard': { country: 'France', region: 'Jura' },
  'cellier saint benoit': { country: 'France', region: 'Jura' },
  'clos du vignes du maynes': { country: 'France', region: 'Bourgogne' },
  'ganevat': { country: 'France', region: 'Jura' },

  // France - Languedoc/Roussillon
  'mas coutelou': { country: 'France', region: 'Languedoc' },
  'closerie sant roc': { country: 'France', region: 'Languedoc' },
  'domaine maxime magnon': { country: 'France', region: 'Languedoc' },
  'maxime magnon': { country: 'France', region: 'Languedoc' },
  'domaine majas': { country: 'France', region: 'Languedoc' },
  'clos roca': { country: 'France', region: 'Languedoc' },
  'roc ange': { country: 'France', region: 'Languedoc' },
  'englevin': { country: 'France', region: 'Languedoc' },
  'ch gaure': { country: 'France', region: 'Languedoc' },
  'léon barral': { country: 'France', region: 'Languedoc' },
  'leon barral': { country: 'France', region: 'Languedoc' },
  'carbonifere': { country: 'France', region: 'Languedoc' },
  'comte des floris': { country: 'France', region: 'Languedoc' },

  // France - Sud-Ouest
  'barouillet': { country: 'France', region: 'Sud-Ouest' },
  'l\'enclos des braves': { country: 'France', region: 'Sud-Ouest' },
  'domaine des perchés': { country: 'France', region: 'Sud-Ouest' },
  'clos larrouyat': { country: 'France', region: 'Sud-Ouest' },
  'cantemerle': { country: 'France', region: 'Sud-Ouest' },

  // France - Alsace
  'brand': { country: 'France', region: 'Alsace' },
  'alsace la rogerie': { country: 'France', region: 'Alsace' },
  'pierre andrey': { country: 'France', region: 'Alsace' },
  'bibendum': { country: 'France', region: 'Alsace' },

  // France - Savoie
  'domaine giachino': { country: 'France', region: 'Savoie' },

  // France - Champagne
  'champagne fleury': { country: 'France', region: 'Champagne' },
  'charlot vincent': { country: 'France', region: 'Champagne' },
  'charlot': { country: 'France', region: 'Champagne' },
  'perseval clement': { country: 'France', region: 'Champagne' },
  'perseval': { country: 'France', region: 'Champagne' },
  'vouette': { country: 'France', region: 'Champagne' },
  'sorbee': { country: 'France', region: 'Champagne' },
  'ruppert leroy': { country: 'France', region: 'Champagne' },
  'ruppert': { country: 'France', region: 'Champagne' },
  'boulard francis': { country: 'France', region: 'Champagne' },
  'boulard': { country: 'France', region: 'Champagne' },
  'delouvin': { country: 'France', region: 'Champagne' },
  'nowack': { country: 'France', region: 'Champagne' },
  'lahaye benoit': { country: 'France', region: 'Champagne' },
  'lahaye': { country: 'France', region: 'Champagne' },
  'laval georges': { country: 'France', region: 'Champagne' },
  'thibault tassin': { country: 'France', region: 'Champagne' },
  'roses de jeanne': { country: 'France', region: 'Champagne' },

  // France - Corsica
  'clos canarelli': { country: 'France', region: 'Corse' },
  'domaine comte abbatucci': { country: 'France', region: 'Corse' },
  'rosumarinu': { country: 'France', region: 'Corse' },

  // France - Loire
  'de mena': { country: 'France', region: 'Loire' },
  'guiberteau': { country: 'France', region: 'Loire' },
  'brendan stater': { country: 'France', region: 'Loire' },
  'clement lavalee': { country: 'France', region: 'Loire' },
  'courtois': { country: 'France', region: 'Loire' },
  'menard pierre': { country: 'France', region: 'Loire' },
  'la martiniere': { country: 'France', region: 'Loire' },
  'jardin de la martini': { country: 'France', region: 'Loire' },
  'domaine ansodelles': { country: 'France', region: 'Languedoc' },
  'vincent roussely': { country: 'France', region: 'Loire' },
  'clos vincent': { country: 'France', region: 'Loire' },
  'quincy': { country: 'France', region: 'Loire' },
  'domaine de coudray': { country: 'France', region: 'Loire' },
  'nicolas suteau': { country: 'France', region: 'Loire' },
  'julien delrieu': { country: 'France', region: 'Loire' },
  'insu': { country: 'France', region: 'Loire' },

  // France - VdF / misc
  'aozina': { country: 'France', region: 'Languedoc' },
  'viti vini': { country: 'France', region: '' },
  'ruiz': { country: 'France', region: 'Languedoc' },
  'les aricoques': { country: 'France', region: '' },
  'terres de chardons': { country: 'France', region: 'Rhône' },
  'cidre vulcain': { country: 'France', region: '' },
  'mousses sauvages': { country: 'France', region: '' },
  'phelan farm': { country: 'Ireland', region: '' },

  // Austria - expanded
  'sepp muster': { country: 'Austria', region: 'Steiermark' },
  'strohmeier': { country: 'Austria', region: 'Steiermark' },
  'kopfensteiner': { country: 'Austria', region: 'Burgenland' },

  // Switzerland
  'arletaz': { country: 'Switzerland', region: 'Valais' },

  // Switzerland
  'le vin de l\'a': { country: 'Switzerland', region: 'Valais' },

  // Serbia
  'bikicki': { country: 'Serbia', region: 'Vojvodina' },

  // Slovenia
  'klinec': { country: 'Slovenia', region: 'Goriška Brda' },
  'štekar': { country: 'Slovenia', region: 'Goriška Brda' },
  'stekar': { country: 'Slovenia', region: 'Goriška Brda' },

  // Czech Republic
  'nestarec': { country: 'Czech Republic', region: 'Moravia' },

  // Portugal
  'poeira': { country: 'Portugal', region: 'Douro' },

  // Hungary
  'palffy': { country: 'Hungary', region: 'Balaton' },
  'st donat': { country: 'Hungary', region: 'Balaton' },
  'bukolyi': { country: 'Hungary', region: 'Eger' },
  'sándor zsolt': { country: 'Hungary', region: 'Villány' },
  'köfejtö': { country: 'Hungary', region: 'Somló' },
  'jónás': { country: 'Hungary', region: 'Tokaj' },
  'csetvei': { country: 'Hungary', region: 'Szekszárd' },
  'pécseli': { country: 'Hungary', region: 'Pécs' },

  // Georgia
  'georgian prestige': { country: 'Georgia', region: 'Kakheti' },

  // Lebanon
  'sept liban': { country: 'Lebanon', region: 'Bekaa Valley' },
  'baal rouge': { country: 'Lebanon', region: 'Bekaa Valley' },

  // Luxembourg
  'georges schiltz': { country: 'Luxembourg', region: 'Moselle' },
  'happy duchy': { country: 'Luxembourg', region: 'Moselle' },

  // Croatia
  'roxanich': { country: 'Croatia', region: 'Istria' },
  'forgeurac': { country: 'Croatia', region: 'Istria' },

  // South Africa
  'grandbois': { country: 'South Africa', region: 'Western Cape' },

  // Cider
  'antidoot': { country: 'Belgium', region: '' },
  'vulcain': { country: 'France', region: '' },
};

// ─── REGIONAL APPELLATIONS ───
const APPELLATIONS = {
  'morgon': { region: 'Beaujolais', country: 'France', grape: 'Gamay', color: 'red' },
  'fleurie': { region: 'Beaujolais', country: 'France', grape: 'Gamay', color: 'red' },
  'brouilly': { region: 'Beaujolais', country: 'France', grape: 'Gamay', color: 'red' },
  'moulin-à-vent': { region: 'Beaujolais', country: 'France', grape: 'Gamay', color: 'red' },
  'chiroubles': { region: 'Beaujolais', country: 'France', grape: 'Gamay', color: 'red' },
  'juliénas': { region: 'Beaujolais', country: 'France', grape: 'Gamay', color: 'red' },
  'régnié': { region: 'Beaujolais', country: 'France', grape: 'Gamay', color: 'red' },
  'chénas': { region: 'Beaujolais', country: 'France', grape: 'Gamay', color: 'red' },
  'côte de brouilly': { region: 'Beaujolais', country: 'France', grape: 'Gamay', color: 'red' },
  'saint-amour': { region: 'Beaujolais', country: 'France', grape: 'Gamay', color: 'red' },
  'beaujolais': { region: 'Beaujolais', country: 'France', grape: 'Gamay', color: 'red' },
  'crozes-hermitage': { region: 'Rhône', country: 'France', grape: 'Syrah' },
  'hermitage': { region: 'Rhône', country: 'France', grape: 'Syrah' },
  'côte-rôtie': { region: 'Rhône', country: 'France', grape: 'Syrah', color: 'red' },
  'cornas': { region: 'Rhône', country: 'France', grape: 'Syrah', color: 'red' },
  'saint-joseph': { region: 'Rhône', country: 'France', grape: 'Syrah' },
  'châteauneuf-du-pape': { region: 'Rhône', country: 'France', grape: 'Grenache blend' },
  'côtes du rhône': { region: 'Rhône', country: 'France' },
  'gigondas': { region: 'Rhône', country: 'France', grape: 'Grenache blend', color: 'red' },
  'vacqueyras': { region: 'Rhône', country: 'France', grape: 'Grenache blend', color: 'red' },
  'chablis': { region: 'Bourgogne', country: 'France', grape: 'Chardonnay', color: 'white' },
  'meursault': { region: 'Bourgogne', country: 'France', grape: 'Chardonnay', color: 'white' },
  'pommard': { region: 'Bourgogne', country: 'France', grape: 'Pinot Noir', color: 'red' },
  'nuits-saint-georges': { region: 'Bourgogne', country: 'France', grape: 'Pinot Noir', color: 'red' },
  'marsannay': { region: 'Bourgogne', country: 'France', grape: 'Pinot Noir', color: 'red' },
  'fixin': { region: 'Bourgogne', country: 'France', grape: 'Pinot Noir', color: 'red' },
  'morey-saint-denis': { region: 'Bourgogne', country: 'France', grape: 'Pinot Noir', color: 'red' },
  'gevrey-chambertin': { region: 'Bourgogne', country: 'France', grape: 'Pinot Noir', color: 'red' },
  'bourgogne': { region: 'Bourgogne', country: 'France' },
  'sancerre': { region: 'Loire', country: 'France', grape: 'Sauvignon Blanc', color: 'white' },
  'vouvray': { region: 'Loire', country: 'France', grape: 'Chenin Blanc', color: 'white' },
  'chinon': { region: 'Loire', country: 'France', grape: 'Cabernet Franc', color: 'red' },
  'bourgueil': { region: 'Loire', country: 'France', grape: 'Cabernet Franc', color: 'red' },
  'savennières': { region: 'Loire', country: 'France', grape: 'Chenin Blanc', color: 'white' },
  'anjou': { region: 'Loire', country: 'France' },
  'muscadet': { region: 'Loire', country: 'France', grape: 'Melon de Bourgogne', color: 'white' },
  'pouilly-fumé': { region: 'Loire', country: 'France', grape: 'Sauvignon Blanc', color: 'white' },
  'chianti': { region: 'Toscana', country: 'Italy', grape: 'Sangiovese', color: 'red' },
  'barolo': { region: 'Piemonte', country: 'Italy', grape: 'Nebbiolo', color: 'red' },
  'rioja': { region: 'Rioja', country: 'Spain' },
  'champagne': { region: 'Champagne', country: 'France', color: 'sparkling' },
  'crémant': { region: '', country: 'France', color: 'sparkling' },
  'corbières': { region: 'Languedoc', country: 'France' },
  'faugères': { region: 'Languedoc', country: 'France' },
  'minervois': { region: 'Languedoc', country: 'France' },
  'bergerac': { region: 'Sud-Ouest', country: 'France' },
  'cahors': { region: 'Sud-Ouest', country: 'France', grape: 'Malbec', color: 'red' },
  'gaillac': { region: 'Sud-Ouest', country: 'France' },
  'irouléguy': { region: 'Sud-Ouest', country: 'France' },
  'arbois': { region: 'Jura', country: 'France' },
  'côtes du jura': { region: 'Jura', country: 'France' },
  'abruzzo': { region: 'Abruzzo', country: 'Italy' },
  'puglia': { region: 'Puglia', country: 'Italy' },
  'toscana': { region: 'Toscana', country: 'Italy' },
  'umbria': { region: 'Umbria', country: 'Italy' },
  'romagna': { region: 'Emilia-Romagna', country: 'Italy' },
  'douro': { region: 'Douro', country: 'Portugal' },
};

// ─── COLOR KEYWORDS ───
const COLOR_RED = /\brouge\b|\bred\b|\btinto\b|\brot\b|\bnoir\b|\brosso\b|\bnegro\b|\bnegre\b/i;
const COLOR_WHITE = /\bblanc\b|\bwhite\b|\bbianco\b|\bblanco\b|\bweiss\b|\bweiß\b/i;
const COLOR_ROSE = /\bros[eé]\b/i;
const COLOR_ORANGE = /\borange\b|\bamber\b|skin[- ]?contact|mac[eé]ration/i;
const COLOR_SPARKLING = /cr[eé]mant|champagne|p[eé]t[- ]?nat|brut|prosecco|cava|spumante|mousseux|sekt|sparkling/i;

// ─── PLACEHOLDER IMAGES BY COLOR ───
const IMAGES = {
  red: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=800&fit=crop',
  white: 'https://images.unsplash.com/photo-1566754436598-de1cf8f0e33c?w=600&h=800&fit=crop',
  rosé: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=600&h=800&fit=crop',
  sparkling: 'https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=600&h=800&fit=crop',
  orange: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&h=800&fit=crop',
  beer: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&h=800&fit=crop',
  cider: 'https://images.unsplash.com/photo-1569919659476-f0852f9fcc16?w=600&h=800&fit=crop',
};

// ─── HELPER FUNCTIONS ───
function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 60);
}

function escapeStr(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function findProducer(name) {
  const n = name.toLowerCase();
  for (const [key, val] of Object.entries(PRODUCERS)) {
    if (n.includes(key)) return val;
  }
  return null;
}

function findGrape(name) {
  const n = name.toLowerCase();
  for (const [key, val] of Object.entries(GRAPE_PATTERNS)) {
    if (n.includes(key)) return val;
  }
  return null;
}

function findAppellation(name) {
  const n = name.toLowerCase();
  for (const [key, val] of Object.entries(APPELLATIONS)) {
    if (n.includes(key)) return val;
  }
  return null;
}

function detectColor(name, excelCat) {
  if (excelCat === 'BEER') return 'beer';
  if (excelCat === 'CIDER') return 'cider';
  const n = name.toLowerCase();
  if (COLOR_SPARKLING.test(n)) return 'sparkling';
  if (COLOR_ROSE.test(n)) return 'rosé';
  if (COLOR_ORANGE.test(n)) return 'orange';
  if (COLOR_RED.test(n)) return 'red';
  if (COLOR_WHITE.test(n)) return 'white';
  return null;
}

function resolveSection(category, region, country) {
  if (category === 'beer') return 'beer';
  if (category === 'cider') return 'cidre';
  if (category === 'sparkling') return 'bubbles';
  if (category === 'orange') return 'orange';

  const color = (category === 'red' || category === 'rosé') ? 'rouge' : 'blanc';

  if (country === 'Luxembourg') return `luxembourg-${color}`;
  if (region === 'Beaujolais') return 'beaujolais-rouge';
  if (region === 'Bourgogne') return `bourgogne-${color}`;
  if (region === 'Rhône') return `rhone-${color}`;
  if (region === 'Loire') return `loire-${color}`;
  if (region === 'Alsace') return 'alsace-blanc';
  if (region === 'Jura') return `jura-${color}`;
  if (region === 'Languedoc' || region === 'Corse') return `languedoc-${color}`;
  if (region === 'Sud-Ouest') return 'sud-ouest-rouge';
  if (region === 'Champagne') return 'bubbles';
  if (region === 'Savoie') return `allemagne-blanc`; // close enough for filter
  if (country === 'Spain') return `espagne-${color}`;
  if (country === 'Italy') return `italie-${color}`;
  if (country === 'Germany' || country === 'Austria') return 'allemagne-blanc';
  if (country === 'Switzerland') return `suisse-${color}`;
  if (country === 'Serbia') return 'serbie-rouge';
  if (country === 'Hungary') return 'hongrie-blanc';
  if (country === 'Slovenia' || country === 'Croatia') return `italie-${color}`;
  if (country === 'Portugal') return `espagne-${color}`;
  if (country === 'Czech Republic') return `allemagne-blanc`;

  return 'uncategorized';
}

function generateDescription(name, grape, region, country, category) {
  const parts = [];

  if (grape && region && country) {
    parts.push({
      fr: `${grape} de ${region}, ${country}.`,
      en: `${grape} from ${region}, ${country}.`,
      de: `${grape} aus ${region}, ${country}.`,
      lb: `${grape} vun ${region}, ${country}.`,
    });
  } else if (region && country) {
    parts.push({
      fr: `Vin de ${region}, ${country}.`,
      en: `Wine from ${region}, ${country}.`,
      de: `Wein aus ${region}, ${country}.`,
      lb: `Wäin vun ${region}, ${country}.`,
    });
  } else if (country) {
    parts.push({
      fr: `Vin de ${country}.`,
      en: `Wine from ${country}.`,
      de: `Wein aus ${country}.`,
      lb: `Wäin vun ${country}.`,
    });
  }

  if (parts.length === 0) {
    return { fr: '', en: '', de: '', lb: '' };
  }

  return parts[0];
}

// ─── MAIN ENRICHMENT ───
const enriched = inStock.map(r => {
  const name = (r['Produit'] || '').trim();
  const excelCat = r['Catégorie'] || 'Vins';
  const supplier = (r['Fournisseur'] || '').trim();
  const price = Math.round((r["Prix d'achat (€)"] || 0) * 100) / 100;
  const qty = r['Quantité'] || 0;
  const ref = r['Référence produit'] || '';
  const barcode = typeof ref === 'number' ? Math.round(ref).toString() : String(ref);

  // Layer 1: Detect color from name
  let category = detectColor(name, excelCat) || 'white';

  // Layer 2: Find producer info
  const producerInfo = findProducer(name);

  // Layer 3: Find grape from name
  const grapeInfo = findGrape(name);

  // Layer 4: Find appellation
  const appellationInfo = findAppellation(name);

  // Merge all layers (later layers override)
  let region = producerInfo?.region || '';
  let country = producerInfo?.country || '';
  let grape = '';

  if (appellationInfo) {
    if (appellationInfo.region) region = appellationInfo.region;
    if (appellationInfo.country) country = appellationInfo.country;
    if (appellationInfo.grape) grape = appellationInfo.grape;
    if (appellationInfo.color && category === 'white') category = appellationInfo.color;
  }

  if (grapeInfo) {
    grape = grapeInfo.grape;
    if (category === 'white' && grapeInfo.color) category = grapeInfo.color;
  }

  // Supplier-based fallback for Georgian Prestige
  if (supplier === 'Georgian Prestige' && !country) {
    country = 'Georgia';
    region = 'Kakheti';
    if (category === 'white') category = 'orange'; // Georgian wines are often orange
  }

  if (supplier === 'Sensodivino' && !country) {
    country = 'Italy';
  }

  if (supplier === 'Happy Duchy' && !country) {
    country = 'Luxembourg';
    region = 'Moselle';
  }

  // Supplier-based fallback: Allwine and Vins Fins are predominantly French wine distributors
  if (!country && (supplier === 'Allwine' || supplier === 'Vins Fins' || supplier === 'VinsFins' || supplier === 'Vinaly')) {
    country = 'France';
  }

  // Additional name-based appellation detection for remaining uncategorized
  if (!region && country === 'France') {
    const n = name.toLowerCase();
    if (/saumur|guiberteau|brendan stater/i.test(n)) region = 'Loire';
    else if (/condrieu|saint.joseph|st joseph|côte.rôtie|cornas|serine/i.test(n)) region = 'Rhône';
    else if (/pouilly.fuiss|nuits.st|côte de beaune|puligny|montrachet|fixin|morey|gevrey|marsannay|meursault|pommard|volnay|bourgogne|chambertin/i.test(n)) region = 'Bourgogne';
    else if (/champagne|meunier|chamery|cumieres|bouzy/i.test(n)) { region = 'Champagne'; category = 'sparkling'; }
    else if (/beaujolais|morgon|fleurie|brouilly|chiroubles|juliénas|régnié|chénas|moulin.+vent/i.test(n)) region = 'Beaujolais';
    else if (/muscadet|vouvray|sancerre|pouilly.fumé|chinon|bourgueil|savennières|anjou|touraine|coteaux du loir/i.test(n)) region = 'Loire';
    else if (/alsace|rogerie/i.test(n)) region = 'Alsace';
    else if (/jura|arbois|château.chalon/i.test(n)) region = 'Jura';
    else if (/corbières|faugères|minervois|languedoc|roussillon|fitou|limoux|cévennes/i.test(n)) region = 'Languedoc';
    else if (/bergerac|cahors|gaillac|irouléguy|jurançon|madiran/i.test(n)) region = 'Sud-Ouest';
    else if (/corse|sartène|ajaccio|patrimonio/i.test(n)) region = 'Corse';
    else if (/côtes du rhône|rhône|ventoux|luberon/i.test(n)) region = 'Rhône';
    else if (/savoie|apremont|chignin/i.test(n)) region = 'Savoie';
  }

  // Section
  const section = resolveSection(category, region, country);

  // Description
  const description = generateDescription(name, grape, region, country, category);

  // Image
  const image = IMAGES[category] || IMAGES.white;

  return {
    id: slugify(name),
    name,
    region,
    country,
    grape,
    category,
    section,
    description,
    priceGlass: 0,
    priceBottle: 0,
    priceShop: price,
    image,
    isAvailable: true,
    isFeatured: false,
    isOrganic: false,
    isBiodynamic: false,
    isNatural: false,
    stock: qty,
    supplier,
    barcode,
  };
});

// ─── STATS ───
const stats = {
  total: enriched.length,
  withGrape: enriched.filter(w => w.grape).length,
  withRegion: enriched.filter(w => w.region).length,
  withCountry: enriched.filter(w => w.country).length,
  withDescription: enriched.filter(w => w.description.fr).length,
  byCategory: {},
  bySection: {},
  byCountry: {},
};
enriched.forEach(w => {
  stats.byCategory[w.category] = (stats.byCategory[w.category] || 0) + 1;
  stats.bySection[w.section] = (stats.bySection[w.section] || 0) + 1;
  if (w.country) stats.byCountry[w.country] = (stats.byCountry[w.country] || 0) + 1;
});

console.log('\n=== ENRICHMENT STATS ===');
console.log(`Total: ${stats.total}`);
console.log(`With grape: ${stats.withGrape} (${(stats.withGrape/stats.total*100).toFixed(0)}%)`);
console.log(`With region: ${stats.withRegion} (${(stats.withRegion/stats.total*100).toFixed(0)}%)`);
console.log(`With country: ${stats.withCountry} (${(stats.withCountry/stats.total*100).toFixed(0)}%)`);
console.log(`With description: ${stats.withDescription} (${(stats.withDescription/stats.total*100).toFixed(0)}%)`);
console.log('\nBy category:', JSON.stringify(stats.byCategory, null, 2));
console.log('\nBy section:', JSON.stringify(stats.bySection, null, 2));
console.log('\nBy country:', JSON.stringify(stats.byCountry, null, 2));
console.log('\nUncategorized count:', stats.bySection.uncategorized || 0);

// Write enriched data as JSON for further processing
fs.writeFileSync('/tmp/enriched-wines.json', JSON.stringify(enriched, null, 2));
console.log('\nWritten /tmp/enriched-wines.json');
