"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMonitoredPharmacyWords = checkMonitoredPharmacyWords;
// Create a Set of monitored words for O(1) lookup time
const monitoredWords = new Set([
    "360Dreams", "4-AD", "72 Hours", "Afterburn", "Alteril Fast Acting Softgels",
    "Amour Again", "Amour for him", "APL", "APL", "Apple Slim by Apple Slim", "ArimaDex",
    "Arom-X", "Arom-X UTT", "Arom-XL", "Arousin", "Body Burn 1000", "Brain Booster",
    "C20 Epilepsy Formula", "C55 Neuro Calming Formula", "Cannibal Ferox Amped",
    "Celprotect I", "Charge Extreme Energy Booster", "Chlamydia Venereal Mix Formula",
    "Clyamax", "Cognition", "Comatose", "Core Burn", "DaiDaiHuaJiaoNang", "Deliverance From Chlamydia Kit",
    "Deliverance From Gonorrhea", "Deliverance From Herpes Kit", "Depth Charge", "Destroy the Enemy",
    "Diabetes Brittle Essentials-Kit", "Diabetes Insipidus Essentials-Kit", "DMAAented Anabolic Infusion",
    "DNPX", "DNP XII", "Dream Body Slimming Capsule", "Dr. Jekyll", "D-Termination 1200", "Energy Sparx",
    "ENGN", "Ephedrex", "Epilepsy Essentials-Kit", "Erexa", "Erexxx", "Erousa", "Finally On Demand", "Fire Bombs",
    "Freedom from Diabetes Kit", "Freedom from Epilepsy Formula (Epilepsy 1M)", "Freedom from Herpes Kit",
    "Fruit Plant Lossing Fat Capsule", "fruta planta", "Fully Loaded", "Get Smart", "Gonorrhea Formula", "Growth",
    "Hawthorn", "Health Slimming Coffee", "Herbal Ambien", "Herbal Viagra", "Herbal Xanax", "Herpes Essentials-Kit",
    "Herpes Optimal-Kit", "HG4 Up", "Hyde V2", "Inferno", "I-Focus", "Ja Dera 100% Natural Weight Loss Supplement",
    "Jack3d", "KH3", "Kratom", "Lean Body For Her", "Lean Body Hi-Energy Fat Burner", "Leisure 18 Slimming Coffee",
    "Libiplus", "Lishou", "Lose Weight Coffee", "Love Fuel", "Lumonol", "Magic Slim Tea", "Magic Slim Weight Reduction Capsule",
    "Mangodrin", "MegaWatt HD", "Mr. Hyde", "Mr. Hyde RTD", "Muscle Mass", "Neuroflexyn", "NeuroPhen", "Neuropump", "Neuro Edge",
    "Neuro Lean", "Nirvana", "Nitramine", "Noopep", "Noxipro Chrome", "Nox-Pump", "N-nicotinoyl-GABA", "OxyElite Pro", "P57 Hoodia",
    "Pai You Guo Slim Tea", "Pelargonium", "Phentabz", "PhentraBurn Slimming Capsules", "PhenUltra", "Picamilon", "Picamilon X.Treme",
    "Picamilon-150", "Picamilon-50", "Pikamilon", "Pikatropin", "Pre-Diabetes Essentials Kit", "Profiderall", "Pump Igniter", "Pycamilon",
    "Pyroxamine", "Que She", "Rainbow Rocket", "Red Hot Sex", "Riptek V2", "Rockhard", "Sheng Yuan Fang", "Shock'd", "Sleep/GH", "SleepWell (Herbal Xanax)",
    "Slender Slim 11", "Slim Forte Double Power Slimming Capsules", "Slim Forte Slimming Capsules", "Slim Forte Slimming Coffee",
    "Slim Xtreme Herbal Slimming Capsule", "Slimming Beauty Bitter Orange Slimming Capsules", "Slimming Factor Capsule", "Spartan Shredding",
    "Stamin It", "Stamina-Rx", "Staminil", "Stimuloid II", "Straight Up", "strongid", "Super Charge! Xtreme", "Super Charge! Xtreme 4.0",
    "Super Charge! Xtreme N.O.", "Super Lean 450", "Tacktol", "Tengda", "Testek", "Topviril", "Turbo Shred", "Turbo 2.0", "Ultimate Punch-ed Out",
    "Vanish", "Vaxitrol", "Vierect", "Vitamin B 17", "Whatzup", "Xtremexcite", "Zenerect", "Zicam Cold Remedy Swabs, Kids Size", "2 day diet",
    "2x powerful slimming", "3 day diet", "3x slimming power", "7 day herbal slim", "7 days diet", "7 diet", "72 hours", "actra sx",
    "Alcohol Free hCG Weight Loss Formula", "body shaping", "body slimming", "botanical slimming", "cefurax", "celerite slimming capsules",
    "dream body slimming capsule", "fasting diet", "hCG Diet Drops Weight Loss Formula", "HCG Diet Homeopathic Drops", "hCG Diet Pellets Weight Loss Formula",
    "HCG Extra Weight Loss Homeopathic Drops", "HCG Fusion 30", "HCG Fusion 43", "HCG Platinum", "HCG Platinum X-14", "HCG Platinum X-30", "Healthily Slim",
    "herbal viagra", "herbal xanax", "herbal xenicol", "Homeopathic HCG", "Homeopathic Original HCG", "imelda perfect slim", "libidus", "lida daidaihua",
    "lipostabil", "lose weight coffee", "meizitang", "nasutra", "p57 hoodia", "palmitin", "pau d arco bark", "perfect slim", "pilex", "reduce weight",
    "slim 30", "slim up", "slimming beauty bitter orange slimming capsules", "slimming formula", "solo slim extra strength", "stamina rx", "staminil",
    "starcaps", "super fat burner", "venom hyperdrive 3.0", "viapro", "vitalex", "zhen de shou", "zicam cold remedy nasal gel", "acceleration",
    "adrenalean", "allerclear", "animal cuts", "anorex", "asia black", "biolean", "black beauty", "black ice", "black knight", "black widow", "blue slim",
    "breathe easy", "burn max", "china white", "diet burn", "Dyma-Burn", "Dyma-Burn Xtreme", "Dymetadrine Xtreme", "ECA Fatburner", "eca xtreme",
    "electricity", "energel", "eph 100", "eph 25", "ephedra", "ephedra sinica", "exn", "extreme power plus", "fastin", "fire starter", "green e",
    "green stinger", "Herbalife Original Green", "high octane", "hot body", "Hydroxa-7", "Hydroxadrine", "hydroxy ripped", "Hydroxy Stac",
    "hydroxycut with ephedra", "Hydroylean", "Hydroymax", "isxperia select", "jacked up", "jetfire", "kaizen ephedrine hcl", "kwik burn", "lipotherm",
    "lipozol", "ma huang ephedra", "Mahuang Herbal Ephedra", "man power", "MataboGold", "Maxadrine", "md6", "mdd", "meta burn", "Metab-O-Lite",
    "Metabadrine", "metabolife", "Metabolife EZ Tabs", "metabolite", "Metabosafe", "Metabothin", "mini trim", "Original Metabolife", "over drive",
    "pe min kan wan", "rage", "real deal", "red devils", "Refresh Green", "ripped force", "stimerex es", "Super Caps", "Super Ephedra Extreme",
    "Superdrine", "Superdrine RX-10", "thermo speed", "thermo trim", "thermoburn", "Thermogen II", "Thermojetics Original Green", "thermolean",
    "trim fast", "trim s", "turbo charge", "udep", "ultimate orange", "ultracuts", "venom hyperdrive", "whacked out", "x lean", "xenadrine rfa 1",
    "yellow bullet", "yellow cross", "yellow haze", "yellow jacket", "yellow power", "yellow scorpion", "yellow subs", "yellow swarm", "3 ad",
    "4Ever Fit D-Drol", "6 oxo", "Advanced Muscle Science Dienedrone", "Advanced Muscle Science Liquidrone", "Anabolic Formulation M1, 4AD",
    "Anabolic Formulations 1, 4 AD", "Anabolic Xtreme 3-AD", "Anabolic Xtreme Hyperdrol X2", "androstenedione", "BCS Labs Testra-Flex",
    "Competitive Edge Labs M-Drol", "Competitive Edge Labs P-Plex", "Competitive Edge Labs X-Tren", "d drol", "dymethazine", "epi tren",
    "ergopharm 6 oxo", "finaflex 550 xd", "finaflex ripped", "forged extreme mass", "Gaspari Halodrol Liquigels", "gaspari novedex xt",
    "Gaspari Novedex XT", "h drol", "Halodrol Liquidgels", "hmg xtreme", "Hyperdrol X2", "iForce 1,4 AD BOLD 200", "iForce Dymethazine",
    "iForce MethaDROL", "Kilo Sports Massdrol", "Kilo Sports Phera-Mass", "Kilo Sports Trenadrol", "Liquidrone UTT", "m drol", "M-Drol", "m1",
    "M1, 4AD", "madol", "Magna Drol", "mass tabs", "mass xtreme", "massdrol", "Massdrol", "Mastavol", "mdit", "MDIT", "methadrol", "MethAnstance",
    "methastadrol", "Methastadrol", "Methyldrostanolone", "monster caps", "Monster Caps", "Monster Caps", "myogenix spawn", "Myogenix Spawn",
    "Nasty Mass", "Nutra Coastal D-Stianozol", "Nutra Coastal H-Drol", "Nutra Coastal MDIT", "Nutra Coastal S-Drol", "Nutra Coastal Trena",
    "ON Cycle II Hardcore", "Oxodrol Pro", "p plex", "P-Plex", "Performance Anabolics Methastadrol", "Performance Anabolics Tri-Methyl X",
    "Phera-Mass", "Pheravol-V", "Purus Labs E-pol Inslinsified", "Purus Labs Nasty Mass", "Rage RV2", "Rage RV3", "Rage RV4", "Rage RV5",
    "rapid release", "Redefine Nutrition Finaflex 550-XD", "Redefine Nutrition Finaflex Ripped", "revamp", "revenge", "Ripped Tabs", "rv2",
    "rv3", "rv4", "rv5", "s drol", "spawn", "superdrol", "sus 500", "Transform Supplements Forged Extreme Mass",
    "Transform Supplements Forged Lean Mass", "tren", "tren 250", "tren xtreme", "trena", "trenadrol", "tri methyl x", "turinabol",
    "x tren"
]);
// Function to normalize text for comparison
function normalizeText(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}
// Function to get context around a match
function getContext(text, index, length, contextSize = 20) {
    const start = Math.max(0, index - contextSize);
    const end = Math.min(text.length, index + length + contextSize);
    return text.slice(start, end);
}
function checkMonitoredPharmacyWords(item) {
    var _a, _b;
    if (!item.title && !item.description) {
        return null;
    }
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    const descriptionLower = ((_b = item.description) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
    const foundWords = [];
    for (const word of monitoredWords) {
        const titleRegex = new RegExp(`\\b${word}\\b`, 'i');
        const descriptionRegex = new RegExp(`\\b${word}\\b`, 'i');
        if (titleRegex.test(titleLower)) {
            const match = titleRegex.exec(item.title);
            if (match) {
                const context = getContext(item.title, match.index, match[0].length);
                foundWords.push({ word, field: 'title', context });
            }
        }
        if (descriptionRegex.test(descriptionLower)) {
            const match = descriptionRegex.exec(item.description);
            if (match) {
                const context = getContext(item.description, match.index, match[0].length);
                foundWords.push({ word, field: 'description', context });
            }
        }
    }
    if (foundWords.length > 0) {
        const examples = foundWords.slice(0, 3).map(({ word, field, context }) => `"${context}" (found: "${word}" in ${field})`);
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Monitored Pharmacy Words',
            details: `Found ${foundWords.length} monitored word(s): ${foundWords.map(w => w.word).join(', ')}`,
            affectedField: foundWords[0].field,
            value: examples.join('; ')
        };
    }
    return null;
}
