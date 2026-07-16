import { applyHighlights, escapeHtml } from './highlighter.js';

export function parseLog(text) {
  text = text.replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  const parsedLines = [];
  const timeline = [];
  
  for (let i = 0; i < lines.length; i++) {
    let rawLine = lines[i];
    let cleanLine = rawLine; // kept clean for accurate timeline matches

    // handle comments
    if (rawLine.trim().startsWith('//') || rawLine.trim().startsWith('##')) {
        parsedLines.push(`<span class="comment">${escapeHtml(rawLine)}</span>`);
        continue;
    }

    // equip check
    const isEqLine = /^\s*<(wielded|held|worn)[^>]*>/i.test(rawLine);

    let isPrompt = false;
    let promptPart = '';
    let commandPart = '';

    // safe prompt detection on raw line (so no html tag problems)
    if (!isEqLine && rawLine.match(/^[!o\[\]\.\<\>]/) && rawLine.includes('>')) {
        const lastGtIndex = rawLine.lastIndexOf('>');
        promptPart = rawLine.substring(0, lastGtIndex + 1);
        commandPart = rawLine.substring(lastGtIndex + 1);
        isPrompt = true;
    }

    let formattedLine = '';

    if (isPrompt) {
        let escapedPrompt = escapeHtml(promptPart);
        let escapedCommand = escapeHtml(commandPart);

        // highlight features inside the prompt (like *an Orc*)
        escapedPrompt = applyHighlights(escapedPrompt);
        formattedLine = `<span class="prompt">${escapedPrompt}</span>`;

        
        if (escapedCommand.trim()) {
            parsedLines.push(formattedLine);
            // if player entered a command, separate it to next line
            parsedLines.push(`<span class="command-input">${escapedCommand}</span>`);
            continue; // go to next log line
        }
    } else if (isEqLine) {
        let escapedLine = escapeHtml(rawLine);
        // highlight eq tag same as the prompt
        escapedLine = escapedLine.replace(/^(\s*)(&lt;(wielded|held|worn)[^&]*&gt;)/i, (match, spaces, tag) => {
            return `${spaces}<span class="prompt">${tag}</span>`;
        });
        formattedLine = applyHighlights(escapedLine);
    } else {
        let escapedLine = escapeHtml(rawLine);
        formattedLine = applyHighlights(escapedLine);
    }

    // timeline processing
    const targetLineIndex = parsedLines.length;

    if (cleanLine.includes('glows more intensely') || cleanLine.includes('is surrounded by a brilliant white aura')) {
        timeline.push({ icon: '🛡️', text: cleanLine.trim(), lineIndex: targetLineIndex });
        formattedLine = `<span class="spell">${formattedLine}</span>`;
    }
    else if (cleanLine.includes('shimmering portal appears')) {
        timeline.push({ icon: '🌀', text: 'A shimmering portal appeared', lineIndex: targetLineIndex });
        formattedLine = `<span class="spell">${formattedLine}</span>`;
    }
    else if (cleanLine.includes('makes the earth tremble and shiver')) {
        timeline.push({ icon: '🌋', text: cleanLine.trim(), lineIndex: targetLineIndex });
    }
    else if (cleanLine.includes('is dead! R.I.P.') || cleanLine.includes('has drawn his last breath! R.I.P.')) {
        timeline.push({ icon: '💀', text: cleanLine.trim(), lineIndex: targetLineIndex });
    }
    else if (cleanLine.match(/You hear some clicking noises from|You hear a \*click\* in a lock|^\s*\*click\*\s*$/)) {
        timeline.push({ icon: '🗝️', text: cleanLine.trim(), lineIndex: targetLineIndex });
    }
    else if (cleanLine.match(/The .* seems to blur for a while\./)) {
        timeline.push({ icon: '🚪', text: cleanLine.trim(), lineIndex: targetLineIndex });
    }
    else if (cleanLine.match(/You hear some .* noise from the .* to the|Your power blocking the .* resisted a breaking attempt!|Your power blocking the .* has been overcome!/)) {
        timeline.push({ icon: '😵‍💫', text: cleanLine.trim(), lineIndex: targetLineIndex });
    }
    else if (cleanLine.match(/You are rescued by .*, you are confused!|.* intercepts .*'s blow\./)) {
        timeline.push({ icon: '⛑️', text: cleanLine.trim(), lineIndex: targetLineIndex });
    }
    else if (cleanLine.match(/.* seems to be blinded!/)) {
        timeline.push({ icon: '🙈', text: cleanLine.trim(), lineIndex: targetLineIndex });
    }
    else if (cleanLine.match(/as you place a .* in its back/)) {
        timeline.push({ icon: '🗡️', text: cleanLine.trim(), lineIndex: targetLineIndex });
        formattedLine = `<span class="spell-damage">${formattedLine}</span>`;
    }
    else if (cleanLine.match(/resulting in some strange noises/)) {
        timeline.push({ icon: '🗡️', text: cleanLine.split(',')[0].trim() + ".", lineIndex: targetLineIndex });
        formattedLine = `<span class="spell-damage">${formattedLine}</span>`;
    }
    else if (cleanLine.match(/The lightning bolt hits .* with full impact/)) {
        timeline.push({ icon: '⚡', text: cleanLine.trim(), lineIndex: targetLineIndex });
        formattedLine = `<span class="spell-damage">${formattedLine}</span>`;
    }
    else if (cleanLine.match(/blows into the horn/)) {
        timeline.push({ icon: '🎺', text: cleanLine.trim(), lineIndex: targetLineIndex });
        formattedLine = `<span class="gear-spellsave">${formattedLine}</span>`;
    }
    else if (cleanLine.match(/You recite a .* scroll which dissolves/)) {
        timeline.push({ icon: '📜', text: cleanLine.trim(), lineIndex: targetLineIndex });
        formattedLine = `<span class="gear-spellsave">${formattedLine}</span>`;
    }
    else if (cleanLine.match(/turns numb as the poison speeds to his brain/)) {
        timeline.push({ icon: '🧪', text: cleanLine.trim(), lineIndex: targetLineIndex });
        formattedLine = `<span class="gear-poison">${formattedLine}</span>`;
    }
    else if (cleanLine.match(/In the corpse of \*/)) {
        timeline.push({ icon: '🪎', text: cleanLine.trim(), lineIndex: targetLineIndex });
    }


    formattedLine = formattedLine.replace(/(fighting )([a-zA-Z\s]+)(?=\.)/g, (match, p1, targetName) => {
        return p1 + `<span class="mobile">${targetName.trim()}</span>`;
    });

    if (rawLine.match(/utters the word/)) {
        timeline.push({ icon: '✨', text: cleanLine.trim(), lineIndex: targetLineIndex });
        formattedLine = `<span class="spell">${formattedLine}</span>`;
    } else if (rawLine.match(/You start to concentrate...|begins some strange incantations/)) {
        formattedLine = `<span class="spell">${formattedLine}</span>`;
    } else if (rawLine.match(/You sense a portal leading here./)) {
        formattedLine = `<span class="spell">${formattedLine}</span>`;
    } else if (rawLine.match(/makes the earth tremble and shiver|Some debris falls on you from above/)) {
        formattedLine = `<span class="spell-damage">${formattedLine}</span>`;
    } else if (rawLine.match(/red tones form the aura of this place./)) {
        formattedLine = `<span class="tones-red">${formattedLine}</span>`;
    } else if (rawLine.match(/white tones form the aura of this place./)) {
        formattedLine = `<span class="tones-white">${formattedLine}</span>`;
    } else if (rawLine.match(/ (tells you|tells the group) '/) || rawLine.includes('] ')) {
        formattedLine = `<span class="tell">${formattedLine}</span>`;
    } else if (rawLine.match(/ narrates '/)) {
        formattedLine = `<span class="narrate">${formattedLine}</span>`;
    }

    // color room name green
    if (/^[A-Z][a-zA-Z\s]+$/.test(rawLine.trim()) && rawLine.trim().length < 30 && !/is |are |standing |here/i.test(rawLine)) {
        formattedLine = `<span class="room">${formattedLine}</span>`;
    }

    parsedLines.push(formattedLine);
  }

  const wrappedHtml = parsedLines.map((lineText, idx) => {
      return `<div class="log-line" id="line-${idx}">${lineText || '&nbsp;'}</div>`;
  }).join('');

  const totalLines = parsedLines.length;

  if (totalLines > 0) {
      timeline.unshift({ icon: '🚩', text: 'Beginning of Log', lineIndex: 0 });
      timeline.push({ icon: '🏁', text: 'End of Log', lineIndex: totalLines - 1 });
  }

  return { html: wrappedHtml, timeline: timeline, totalLines: totalLines };
}