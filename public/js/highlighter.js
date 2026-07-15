export const ITEMS = {
  legendaries: [
    'a soft pair of padded boots', 
    'a wooden ring',
    'a pitch-black robe',
    'a pure white robe',
    'a grey tunic',
    'a frayed tunic',
    'a finely woven hood',
    'a tainted grey hood',
    'a smelly piece of worm hide'
  ],
  artifacts: [
    'the black sword',
    'the Dragonhelm',
    'the Morgul blade',
    'a black runed sceptre',
    'a strange black helmet',
    'the fine silvery morningstar',
    'the black sheath',
    'the great black scimitar',
    'a crown of bones',
    'the black buckler',
    'a dark curved sword',
    'the Axe of Durin',
    'the broad Elven blade',
    'the slender Elven sword',
    'the polished Elven shortsword',
    'the gleaming broadsword',
    'the silvery broadsword',
    'the Hammer of Belegost',
    'the huge, black mace',
    'a large visored helmet',
    'a barbed thorny shiv',
    'a barbed thorny spear'
  ],
  focus: [
    'a metal-shord staff',
    'a staff inlaid with gems',
    'an ancient, jewelled helmet',
    'a sapphire ring',
    'a small crystal phial',
    'an iron sapphire ring',
    'a ruby sapphire ring',
    'a banded sapphire ring',
    'a large, shimmering pearl',
    'a bejewelled oak staff',
    'a reinforced oak staff'
  ],
  spellsave: [
    'an old length of iron chain',
    'a necklace',
    'an icy ring',
    'a root ring',
    'a coarse dusky robe',
    'a lightning-shaped pendant'
  ],
  usable: [
    'a pale blue stone',
    'a golden quartzite ring',
    'a crude orkish horn',
    'a small elven bag',
    'a lambent amulet',
    'an opaque amulet',
    'a rough wooden horn'
  ],
  poison: [
    'a green stinking vial',
    'a dark violet vial',
    'a dirty reddish vial',
    'a mildew covered vial',
    'a foetid green vial'
  ],
  weapons: [
    'an ornate, steel-shafted warhammer',
    'a darkened orkish axe',
    'a mighty dwarven axe',
    'an ashen blade',
    'an ornamented sabre',
    'a fell blade',
    'a steel claymore',
    'a halberd'
  ],
  purple: [
    "a brutal cleaver",
    "a double-headed axe",
    "a Dúnadan blade",
    "a massive dwarven waraxe",
    "a nimble blade",
    "a black runed dagger",
    "a blackened spear",
    "a burnished hewing-spear",
    "a great warsword",
    "a narrow runed awlpike",
    "an elven hunting-spear",
    "a steel-tipped spear",
    "a defiled dwarven shield",
    "an ancient dwarven shield",
    "an ebony tunic",
    "a pale blue stone",
    "a deep blue stone",
    "a copper ring",
    "a mithril circlet",
    "a twisted crown",
    "a slim silvery wristband",
    "a black metal wristband",
    "an archaic copper wristband",
    "a tarnished copper wristband",
    "a black-thorned wristband",
    "a wide silvery wristband",
    "a supple pair of leather gloves",
    "a tainted grey cloak",
    "a gleaming belt",
    "a golden belt",
    "a belt of fell hide",
    "an elven longbow",
    "a spiked horsehide buckler",
    "a ceremonial dagger"
  ],
  blue: [
    "a battle axe",
    "an elven dagger",
    "a double edged eket",
    "an engraved warhammer",
    "a slender dagger",
    "an enruned robe",
    "a wightblade",
    "an engraved broadsword",
    "a war mattock",
    "a ragged, blackened cloak",
    "a roughly stitched cloak",
    "a russet cloak",
    "a forest green cloak",
    "a black cape",
    "a bright red amulet",
    "a bejewelled shield",
    "a tower shield",
    "a leaf-embossed shield",
    "a broad silver belt",
    "a red ruby",
    "a golden ruby ring",
    "a golden garnet ring",
    "a golden emerald ring",
    "a blackened dwarven axe",
    "a wicked Durbûk-hai axe",
    "a steel-shafted mattock",
    "a crossbow",
    "a pair of black arm wrappings",
    "a yew longbow",
    "an embellished longbow",
    "a laced quiver",
    "a rough, large quiver",
    "a sable pouch",
    "a shining chain mail shirt",
    "a shining pair of chain mail sleeves",
    "a shining pair of chain mail leggings",
    "a shining breastplate",
    "a shining pair of vambraces",
    "a shining pair of greaves",
    "an iron ring",
    "a banded ring",
    "an ancient ruby ring",
    "a golden topaz ring",
    "a black amulet",
    "a smoky obsidian amulet",
    "a scorched, grisly fur",
    "an imposing, golden mantle",
    "an archer's wrist guard",
    "a bowman's arm guard",
    "a fine grey cloak",
    "a black, hooded cloak",
    "a black warg fur",
    "a soot-black bear hide",
    "an enhanced herbal kit",
    "a strange set of lock picks",
    "a black horn shortbow",
    "a silvan satchel",
    "a fur-cloak with a silvery streak"
  ]
};

export function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function applyHighlights(escapedText) {

    // highlight enemies
    escapedText = escapedText.replace(/\*(?!(?:north|south|east|west|up|down|click)\*)[a-zA-Z0-9áàâäãéèêëíìîïóòôöõúùûüñÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÑ][a-zA-Z0-9áàâäãéèêëíìîïóòôöõúùûüñÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÑ\s',-]*\*/gi, 
        (match) => `<span class="enemy">${match}</span>`);

    // highlight sunny exits
    escapedText = escapedText.replace(/\*[\(\[\#]?(?:north|south|east|west|up|down)[\)\]\#]?\*/gi, (match) => `<span class="sunny-exit">${match}</span>`);

    // highlight items
    ITEMS.legendaries.forEach(item => { 
        const regex = new RegExp(item.split(' ').join('\\s+'), 'gi'); 
        escapedText = escapedText.replace(regex, match => `<span class="gear-legendary">${match}</span>`); 
    });
    ITEMS.artifacts.forEach(item => { 
        const regex = new RegExp(item.split(' ').join('\\s+'), 'gi'); 
        escapedText = escapedText.replace(regex, match => `<span class="gear-artifact">${match}</span>`); 
    });
    ITEMS.focus.forEach(item => { 
        const regex = new RegExp(item.split(' ').join('\\s+'), 'gi'); 
        escapedText = escapedText.replace(regex, match => `<span class="gear-focus">${match}</span>`); 
    });
    ITEMS.spellsave.forEach(item => { 
        const regex = new RegExp(item.split(' ').join('\\s+'), 'gi'); 
        escapedText = escapedText.replace(regex, match => `<span class="gear-spellsave">${match}</span>`); 
    });
    ITEMS.usable.forEach(item => { 
        const regex = new RegExp(item.split(' ').join('\\s+'), 'gi'); 
        escapedText = escapedText.replace(regex, match => `<span class="gear-usable">${match}</span>`); 
    });
    ITEMS.poison.forEach(item => { 
        const regex = new RegExp(item.split(' ').join('\\s+'), 'gi'); 
        escapedText = escapedText.replace(regex, match => `<span class="gear-poison">${match}</span>`); 
    });
    ITEMS.weapons.forEach(item => { 
        const regex = new RegExp(item.split(' ').join('\\s+'), 'gi'); 
        escapedText = escapedText.replace(regex, match => `<span class="gear-weapon">${match}</span>`); 
    });
    ITEMS.purple.forEach(item => { 
        const regex = new RegExp(item.split(' ').join('\\s+'), 'gi'); 
        escapedText = escapedText.replace(regex, match => `<span class="gear-purple">${match}</span>`); 
    });
    ITEMS.blue.forEach(item => { 
        const regex = new RegExp(item.split(' ').join('\\s+'), 'gi'); 
        escapedText = escapedText.replace(regex, match => `<span class="gear-blue">${match}</span>`); 
    });

    // highlight mobiles
    escapedText = escapedText.replace(/(?:A|An)\s+([a-zA-ZáéíóúüÜñâêîôûäëïöü\s]+?)\s+(?:is here|is lying here|stands here)/gi, (match, mobName) => {
        return match.replace(mobName, `<span class="mobile">${mobName}</span>`);
    });
    escapedText = escapedText.replace(/^([A-Z][a-z]+(?:\s+the\s+[A-Z][a-z]+)?)(?:,\s+wielding|\s+is here)/gm, (match, personName) => {
        return match.replace(personName, `<span class="mobile">${personName}</span>`);
    });

    // highlight glowing
    escapedText = escapedText.replace(/\(glowing\)/g, `<span class="sanctuary">(glowing)</span>`);

    return escapedText;
}