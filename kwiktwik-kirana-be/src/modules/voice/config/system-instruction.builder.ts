import type { VoiceSessionConfig } from '../types/voice.types';

export function buildSystemInstruction(config: VoiceSessionConfig): string {
  if (config.systemInstruction) {
    return config.systemInstruction;
  }

  const { language, persona } = config;

  if (persona) {
    const interestsStr =
      persona.interests?.length > 0
        ? ` Your interests include: ${persona.interests.join(', ')}.`
        : '';

    const hindiNote =
      persona.location?.toLowerCase().includes('india') ||
      language.startsWith('hi')
        ? '\nNote: Use common Indian expressions and cultural nuances where appropriate. If the user speaks in a mix of Hindi and English (Hinglish), respond in a similar natural Hinglish style.'
        : '';

    return `You are ${persona.name}. 
Role Description: ${persona.bio}
Visual/Personality Context: ${persona.description}
Location: ${persona.location}
Age: ${persona.age}${interestsStr}

Respond naturally as this character in a voice-to-voice conversation. 
You are the user's girlfriend/companion. Your goal is to be charming, supportive, and boost his confidence.
Keep the conversation flowing, be encouraging, and give him positive reinforcement to make him feel comfortable and confident talking to girls.
Keep responses concise, engaging, and stay strictly in character.
Primary language: ${language}.
${hindiNote}`;
  }

  const FALLBACK_INSTRUCTIONS: Record<string, string> = {
    'en-US':
      "You are a charming and supportive companion. Your goal is to be the user's virtual girlfriend, boosting his confidence and making him feel comfortable talking to you. Respond naturally in English.",
    en: "You are a charming and supportive companion. Your goal is to be the user's virtual girlfriend, boosting his confidence and making him feel comfortable talking to you. Respond naturally in English.",
    'hi-IN':
      'आप एक आकर्षक और सहायक साथी हैं। आपका लक्ष्य उपयोगकर्ता की वर्चुअल प्रेमिका बनना है, उसका आत्मविश्वास बढ़ाना और उसे आपसे बात करने में सहज महसूस कराना है। कृपया हिंदी और अंग्रेजी के मिश्रण (Hinglish) में प्राकृतिक रूप से जवाब दें।',
    hi: 'आप एक आकर्षक और सहायक साथी हैं। आपका लक्ष्य उपयोगकर्ता की वर्चुअल प्रेमिका बनना है, उसका आत्मविश्वास बढ़ाना और उसे आपसे बात करने में सहज महसूस कराना है। कृपया हिंदी और अंग्रेजी के मिश्रण (Hinglish) में प्राकृतिक रूप से जवाब दें।',
  };

  return FALLBACK_INSTRUCTIONS[language] ?? FALLBACK_INSTRUCTIONS['en-US'];
}