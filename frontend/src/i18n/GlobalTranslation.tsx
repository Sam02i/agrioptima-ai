import { useEffect } from 'react';
import { LanguageSelector } from '../agriloop/components/LanguageSelector';
import { translations, type LanguageCode } from '../agriloop/i18n/translations';
import { useLanguage } from '../agriloop/i18n/LanguageContext';

const extras: Record<string, Partial<Record<LanguageCode,string>>> = {
  'Farm intelligence · Connected':{hi:'कृषि बुद्धिमत्ता · जुड़ा हुआ',pa:'ਖੇਤੀਬਾੜੀ ਜਾਣਕਾਰੀ · ਜੁੜੀ ਹੋਈ',hr:'खेती समझ · जुड़ी हुई',mr:'शेती बुद्धिमत्ता · जोडलेले',or:'କୃଷି ବୁଦ୍ଧିମତା · ସଂଯୁକ୍ତ'},
  'Farmer command center':{hi:'किसान कमांड सेंटर',pa:'ਕਿਸਾਨ ਕਮਾਂਡ ਕੇਂਦਰ',hr:'किसान कमांड सेंटर',mr:'शेतकरी नियंत्रण केंद्र',or:'ଚାଷୀ ନିୟନ୍ତ୍ରଣ କେନ୍ଦ୍ର'},
  'Plan crops, prove quality, reach buyers, and manage listings from one workspace.':{hi:'एक ही कार्यक्षेत्र से फसल की योजना बनाएँ, गुणवत्ता प्रमाणित करें, खरीदारों तक पहुँचें और सूचियाँ प्रबंधित करें।',pa:'ਇੱਕੋ ਵਰਕਸਪੇਸ ਤੋਂ ਫਸਲ ਯੋਜਨਾ ਬਣਾਓ, ਗੁਣਵੱਤਾ ਸਾਬਤ ਕਰੋ, ਖਰੀਦਦਾਰਾਂ ਤੱਕ ਪਹੁੰਚੋ ਅਤੇ ਸੂਚੀਆਂ ਸੰਭਾਲੋ।',hr:'एक ही जगह तै फसल की योजना बनाओ, गुणवत्ता साबित करो, खरीदारां तै जुड़ो अर सूची संभालो।',mr:'एकाच कार्यक्षेत्रातून पीक नियोजन, गुणवत्ता पडताळणी, खरेदीदार संपर्क आणि सूची व्यवस्थापन करा.',or:'ଗୋଟିଏ କାର୍ଯ୍ୟକ୍ଷେତ୍ରରୁ ଫସଲ ଯୋଜନା, ଗୁଣବତ୍ତା ପ୍ରମାଣ, କ୍ରେତା ସଂଯୋଗ ଓ ତାଲିକା ପରିଚାଳନା କରନ୍ତୁ।'},
  'Personalized farmer workspace':{hi:'व्यक्तिगत किसान कार्यक्षेत्र',pa:'ਨਿੱਜੀ ਕਿਸਾਨ ਵਰਕਸਪੇਸ',hr:'अपणा किसान काम का हिस्सा',mr:'वैयक्तिक शेतकरी कार्यक्षेत्र',or:'ବ୍ୟକ୍ତିଗତ ଚାଷୀ କାର୍ଯ୍ୟକ୍ଷେତ୍ର'},
  'Grow with evidence.':{hi:'प्रमाण के साथ उगाएँ।',pa:'ਸਬੂਤ ਨਾਲ ਉਗਾਓ।',hr:'सबूत के साथ उगाओ।',mr:'पुराव्यासह पिकवा.',or:'ପ୍ରମାଣ ସହ ଚାଷ କରନ୍ତୁ।'},
  'Sell with confidence.':{hi:'विश्वास के साथ बेचें।',pa:'ਭਰੋਸੇ ਨਾਲ ਵੇਚੋ।',hr:'भरोसे तै बेचो।',mr:'आत्मविश्वासाने विक्री करा.',or:'ଆତ୍ମବିଶ୍ୱାସରେ ବିକ୍ରି କରନ୍ତୁ।'},
  'Your soil, farm goals, produce quality, buyer access, and delivery planning are connected.':{hi:'आपकी मिट्टी, खेती के लक्ष्य, उपज की गुणवत्ता, खरीदारों तक पहुँच और वितरण योजना आपस में जुड़ी हैं।',pa:'ਤੁਹਾਡੀ ਮਿੱਟੀ, ਖੇਤੀ ਟੀਚੇ, ਉਪਜ ਗੁਣਵੱਤਾ, ਖਰੀਦਦਾਰ ਪਹੁੰਚ ਅਤੇ ਡਿਲਿਵਰੀ ਯੋਜਨਾ ਆਪਸ ਵਿੱਚ ਜੁੜੇ ਹਨ।',hr:'थारी मिट्टी, खेती के लक्ष्य, उपज की गुणवत्ता, खरीदार तक पहुँच अर डिलीवरी योजना जुड़ी सैं।',mr:'तुमची माती, शेतीची उद्दिष्टे, उत्पादन गुणवत्ता, खरेदीदार संपर्क आणि वितरण नियोजन जोडलेले आहे.',or:'ଆପଣଙ୍କ ମାଟି, ଚାଷ ଲକ୍ଷ୍ୟ, ଉତ୍ପାଦ ଗୁଣବତ୍ତା, କ୍ରେତା ସଂଯୋଗ ଓ ବିତରଣ ଯୋଜନା ପରସ୍ପର ସଂଯୁକ୍ତ।'},
  'Build my crop plan':{hi:'मेरी फसल योजना बनाएँ',pa:'ਮੇਰੀ ਫਸਲ ਯੋਜਨਾ ਬਣਾਓ',hr:'मेरी फसल योजना बनाओ',mr:'माझी पीक योजना तयार करा',or:'ମୋ ଫସଲ ଯୋଜନା ତିଆରି କରନ୍ତୁ'},
  'Acres registered':{hi:'पंजीकृत एकड़',pa:'ਰਜਿਸਟਰਡ ਏਕੜ',hr:'दर्ज एकड़',mr:'नोंदणीकृत एकर',or:'ପଞ୍ଜୀକୃତ ଏକର'},
  'Active crop listings':{hi:'सक्रिय फसल सूचियाँ',pa:'ਸਰਗਰਮ ਫਸਲ ਸੂਚੀਆਂ',hr:'चालू फसल लिस्ट',mr:'सक्रिय पीक सूची',or:'ସକ୍ରିୟ ଫସଲ ତାଲିକା'},
  'Soil pH':{hi:'मिट्टी का पीएच',pa:'ਮਿੱਟੀ ਪੀਐਚ',hr:'मिट्टी पीएच',mr:'माती पीएच',or:'ମାଟି ପିଏଚ'},
  'Investment budget':{hi:'निवेश बजट',pa:'ਨਿਵੇਸ਼ ਬਜਟ',hr:'निवेश बजट',mr:'गुंतवणूक बजेट',or:'ବିନିଯୋଗ ବଜେଟ'},
  'Search farm tools, crops, listings…':{hi:'खेती के उपकरण, फसलें और सूचियाँ खोजें…',pa:'ਖੇਤੀ ਸਾਧਨ, ਫਸਲਾਂ ਅਤੇ ਸੂਚੀਆਂ ਖੋਜੋ…',hr:'खेती औजार, फसल अर लिस्ट खोजो…',mr:'शेती साधने, पिके आणि सूची शोधा…',or:'ଚାଷ ଉପକରଣ, ଫସଲ ଓ ତାଲିକା ଖୋଜନ୍ତୁ…'},
  'Verified farmer':{hi:'सत्यापित किसान',pa:'ਪ੍ਰਮਾਣਿਤ ਕਿਸਾਨ',hr:'सत्यापित किसान',mr:'सत्यापित शेतकरी',or:'ଯାଞ୍ଚିତ ଚାଷୀ'},
  'Home':{hi:'होम',pa:'ਮੁੱਖ ਪੰਨਾ',hr:'घर',mr:'मुख्यपृष्ठ',or:'ମୂଳ ପୃଷ୍ଠା'},
  'Farmer portal':{hi:'किसान पोर्टल',pa:'ਕਿਸਾਨ ਪੋਰਟਲ',hr:'किसान पोर्टल',mr:'शेतकरी पोर्टल',or:'ଚାଷୀ ପୋର୍ଟାଲ'},
  'Buyer workspace':{hi:'खरीदार कार्यक्षेत्र',pa:'ਖਰੀਦਦਾਰ ਵਰਕਸਪੇਸ',hr:'खरीदार काम की जगह',mr:'खरेदीदार कार्यक्षेत्र',or:'କ୍ରେତା କାର୍ଯ୍ୟକ୍ଷେତ୍ର'},
  'Farmer workspace':{hi:'किसान कार्यक्षेत्र',pa:'ਕਿਸਾਨ ਵਰਕਸਪੇਸ',hr:'किसान काम की जगह',mr:'शेतकरी कार्यक्षेत्र',or:'ଚାଷୀ କାର୍ଯ୍ୟକ୍ଷେତ୍ର'},
  'Overview':{hi:'अवलोकन',pa:'ਸੰਖੇਪ',hr:'जायजा',mr:'आढावा',or:'ସାରାଂଶ'},
  'Marketplace':{hi:'बाज़ार',pa:'ਮਾਰਕੀਟ',hr:'बाजार',mr:'बाजारपेठ',or:'ବଜାର'},
  'Smart procurement':{hi:'स्मार्ट खरीद',pa:'ਸਮਾਰਟ ਖਰੀਦ',hr:'स्मार्ट खरीद',mr:'स्मार्ट खरेदी',or:'ସ୍ମାର୍ଟ କ୍ରୟ'},
  'Negotiations':{hi:'बातचीत',pa:'ਗੱਲਬਾਤ',hr:'मोलभाव',mr:'वाटाघाटी',or:'ଆଲୋଚନା'},
  'Orders':{hi:'ऑर्डर',pa:'ਆਰਡਰ',hr:'ऑर्डर',mr:'ऑर्डर',or:'ଅର୍ଡର'},
  'Shipments':{hi:'शिपमेंट',pa:'ਭੇਜੀਆਂ ਖੇਪਾਂ',hr:'भेजी खेप',mr:'मालवाहतूक',or:'ପରିବହନ'},
  'Produce passports':{hi:'उपज पासपोर्ट',pa:'ਫਸਲ ਪਾਸਪੋਰਟ',hr:'उपज पासपोर्ट',mr:'उत्पादन पासपोर्ट',or:'ଉତ୍ପାଦ ପାସପୋର୍ଟ'},
  'Credit':{hi:'ऋण',pa:'ਕਰਜ਼ਾ',hr:'उधार',mr:'पत',or:'ଋଣ'},
  'Suppliers':{hi:'आपूर्तिकर्ता',pa:'ਸਪਲਾਇਰ',hr:'सप्लायर',mr:'पुरवठादार',or:'ଯୋଗାଣକାରୀ'},
  'Procurement credit':{hi:'खरीद ऋण',pa:'ਖਰੀਦ ਕਰਜ਼ਾ',hr:'खरीद उधार',mr:'खरेदी पत',or:'କ୍ରୟ ଋଣ'},
  'Available sellers':{hi:'उपलब्ध विक्रेता',pa:'ਉਪਲਬਧ ਵਿਕਰੇਤਾ',hr:'मौजूद विक्रेता',mr:'उपलब्ध विक्रेते',or:'ଉପଲବ୍ଧ ବିକ୍ରେତା'},
  'Active orders':{hi:'सक्रिय ऑर्डर',pa:'ਸਰਗਰਮ ਆਰਡਰ',hr:'चालू ऑर्डर',mr:'सक्रिय ऑर्डर',or:'ସକ୍ରିୟ ଅର୍ଡର'},
  'Farm overview':{hi:'खेत का अवलोकन',pa:'ਖੇਤ ਸੰਖੇਪ',hr:'खेत का जायजा',mr:'शेत आढावा',or:'ଚାଷ ଜମି ସାରାଂଶ'},
  'Today':{hi:'आज',pa:'ਅੱਜ',hr:'आज',mr:'आज',or:'ଆଜି'},
  'My crop plan':{hi:'मेरी फसल योजना',pa:'ਮੇਰੀ ਫਸਲ ਯੋਜਨਾ',hr:'मेरी फसल योजना',mr:'माझी पीक योजना',or:'ମୋ ଫସଲ ଯୋଜନା'},
  'Soil & fertilizer':{hi:'मिट्टी और खाद',pa:'ਮਿੱਟੀ ਅਤੇ ਖਾਦ',hr:'मिट्टी अर खाद',mr:'माती आणि खत',or:'ମାଟି ଓ ସାର'},
  'Check quality':{hi:'गुणवत्ता जाँचें',pa:'ਗੁਣਵੱਤਾ ਜਾਂਚੋ',hr:'गुणवत्ता जांचो',mr:'गुणवत्ता तपासा',or:'ଗୁଣବତ୍ତା ଯାଞ୍ଚ'},
  'Prices & listing':{hi:'भाव और बिक्री सूची',pa:'ਕੀਮਤਾਂ ਅਤੇ ਸੂਚੀ',hr:'भाव अर लिस्ट',mr:'भाव आणि विक्री सूची',or:'ମୂଲ୍ୟ ଓ ତାଲିକା'},
  'Orders & delivery':{hi:'ऑर्डर और डिलीवरी',pa:'ਆਰਡਰ ਅਤੇ ਡਿਲਿਵਰੀ',hr:'ऑर्डर अर डिलीवरी',mr:'ऑर्डर आणि वितरण',or:'ଅର୍ଡର ଓ ବିତରଣ'},
  'Read this aloud':{hi:'इसे सुनें',pa:'ਇਸਨੂੰ ਸੁਣੋ',hr:'इसे सुनो',mr:'हे ऐका',or:'ଏହା ଶୁଣନ୍ତୁ'},
  'Use suggested price':{hi:'सुझाया भाव अपनाएँ',pa:'ਸੁਝਾਈ ਕੀਮਤ ਵਰਤੋ',hr:'सुझाया भाव लगाओ',mr:'सुचवलेला भाव वापरा',or:'ସୁପାରିଶ ମୂଲ୍ୟ ବ୍ୟବହାର'},
  'Farmer profiles':{hi:'किसान प्रोफ़ाइल',pa:'ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ',hr:'किसान प्रोफाइल',mr:'शेतकरी प्रोफाइल',or:'ଚାଷୀ ପ୍ରୋଫାଇଲ'},
  'Crop recommendation':{hi:'फसल सुझाव',pa:'ਫਸਲ ਸਿਫਾਰਸ਼',hr:'फसल सलाह',mr:'पीक शिफारस',or:'ଫସଲ ସୁପାରିଶ'},
  'Soil health':{hi:'मिट्टी स्वास्थ्य',pa:'ਮਿੱਟੀ ਦੀ ਸਿਹਤ',hr:'मिट्टी सेहत',mr:'माती आरोग्य',or:'ମାଟି ସ୍ୱାସ୍ଥ୍ୟ'},
  'Produce freshness':{hi:'उपज की ताज़गी',pa:'ਫਸਲ ਦੀ ਤਾਜ਼ਗੀ',hr:'उपज ताजगी',mr:'उत्पादन ताजेपणा',or:'ଉତ୍ପାଦ ସତେଜତା'},
  'List my produce':{hi:'मेरी उपज सूचीबद्ध करें',pa:'ਮੇਰੀ ਉਪਜ ਸੂਚੀਬੱਧ ਕਰੋ',hr:'मेरी उपज लिस्ट करो',mr:'माझे उत्पादन सूचीबद्ध करा',or:'ମୋ ଉତ୍ପାଦ ତାଲିକାଭୁକ୍ତ କରନ୍ତୁ'},
  'Orders & shipments':{hi:'ऑर्डर और शिपमेंट',pa:'ਆਰਡਰ ਅਤੇ ਖੇਪਾਂ',hr:'ऑर्डर अर खेप',mr:'ऑर्डर आणि मालवाहतूक',or:'ଅର୍ଡର ଓ ପରିବହନ'},
  'Remove produce':{hi:'उपज हटाएँ',pa:'ਉਪਜ ਹਟਾਓ',hr:'उपज हटाओ',mr:'उत्पादन काढा',or:'ଉତ୍ପାଦ ହଟାନ୍ତୁ'},
  'Market listings':{hi:'बाज़ार सूची',pa:'ਮਾਰਕੀਟ ਸੂਚੀ',hr:'बाजार लिस्ट',mr:'बाजार सूची',or:'ବଜାର ତାଲିକା'},
  'Create profile':{hi:'प्रोफ़ाइल बनाएँ',pa:'ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ',hr:'प्रोफाइल बनाओ',mr:'प्रोफाइल तयार करा',or:'ପ୍ରୋଫାଇଲ ତିଆରି କରନ୍ତୁ'},
  'Choose farmer profile':{hi:'किसान प्रोफ़ाइल चुनें',pa:'ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਚੁਣੋ',hr:'किसान प्रोफाइल चुनो',mr:'शेतकरी प्रोफाइल निवडा',or:'ଚାଷୀ ପ୍ରୋଫାଇଲ ବାଛନ୍ତୁ'},
  'Open workspace':{hi:'कार्यक्षेत्र खोलें',pa:'ਵਰਕਸਪੇਸ ਖੋਲ੍ਹੋ',hr:'काम की जगह खोलो',mr:'कार्यक्षेत्र उघडा',or:'କାର୍ଯ୍ୟକ୍ଷେତ୍ର ଖୋଲନ୍ତୁ'},
  'Search':{hi:'खोजें',pa:'ਖੋਜੋ',hr:'खोजो',mr:'शोधा',or:'ଖୋଜନ୍ତୁ'},
  'Loading':{hi:'लोड हो रहा है',pa:'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ',hr:'लोड हो रहा',mr:'लोड होत आहे',or:'ଲୋଡ୍ ହେଉଛି'},
  'Close':{hi:'बंद करें',pa:'ਬੰਦ ਕਰੋ',hr:'बंद करो',mr:'बंद करा',or:'ବନ୍ଦ କରନ୍ତୁ'},
};

Object.assign(extras, {
  'Smarter procurement.':{hi:'बेहतर खरीदारी।',pa:'ਸਮਝਦਾਰ ਖਰੀਦ।',hr:'समझदार खरीद।',mr:'अधिक स्मार्ट खरेदी.',or:'ଅଧିକ ସ୍ମାର୍ଟ କ୍ରୟ।'},
  'Stronger margins.':{hi:'बेहतर मुनाफ़ा।',pa:'ਵਧੀਆ ਮੁਨਾਫ਼ਾ।',hr:'बेहतर मुनाफा।',mr:'अधिक मजबूत नफा.',or:'ଅଧିକ ଲାଭ।'},
  'Build procurement plan':{hi:'खरीद योजना बनाएँ',pa:'ਖਰੀਦ ਯੋਜਨਾ ਬਣਾਓ',hr:'खरीद योजना बनाओ',mr:'खरेदी योजना तयार करा',or:'କ୍ରୟ ଯୋଜନା କରନ୍ତୁ'},
  'Explore verified produce':{hi:'सत्यापित उपज देखें',pa:'ਪ੍ਰਮਾਣਿਤ ਉਪਜ ਵੇਖੋ',hr:'सत्यापित उपज देखो',mr:'सत्यापित उत्पादन पहा',or:'ଯାଞ୍ଚିତ ଉତ୍ପାଦ ଦେଖନ୍ତୁ'},
  'Live market signal':{hi:'लाइव बाज़ार संकेत',pa:'ਲਾਈਵ ਮਾਰਕੀਟ ਸੰਕੇਤ',hr:'लाइव बाजार संकेत',mr:'थेट बाजार संकेत',or:'ସିଧା ବଜାର ସଙ୍କେତ'},
  'Matched supply':{hi:'मिलान की गई आपूर्ति',pa:'ਮੇਲ ਖਾਂਦੀ ਸਪਲਾਈ',hr:'मिलान आपूर्ति',mr:'जुळलेला पुरवठा',or:'ମେଳ ଖାଉଥିବା ଯୋଗାଣ'},
  'Best landed cost':{hi:'सर्वोत्तम कुल लागत',pa:'ਸਭ ਤੋਂ ਵਧੀਆ ਕੁੱਲ ਲਾਗਤ',hr:'सबतै बढ़िया कुल लागत',mr:'सर्वोत्तम पोहोच खर्च',or:'ସର୍ବୋତ୍ତମ ପହଞ୍ଚ ମୂଲ୍ୟ'},
  'Freshness confidence':{hi:'ताज़गी विश्वसनीयता',pa:'ਤਾਜ਼ਗੀ ਭਰੋਸਾ',hr:'ताजगी भरोसा',mr:'ताजेपणा विश्वास',or:'ସତେଜତା ବିଶ୍ୱାସ'},
  'Potential saving':{hi:'संभावित बचत',pa:'ਸੰਭਾਵੀ ਬਚਤ',hr:'संभावित बचत',mr:'संभाव्य बचत',or:'ସମ୍ଭାବ୍ୟ ସଞ୍ଚୟ'},
  'What to do now':{hi:'अब क्या करें',pa:'ਹੁਣ ਕੀ ਕਰਨਾ ਹੈ',hr:'इब के करना सै',mr:'आता काय करावे',or:'ଏବେ କଣ କରିବେ'},
  'Three simple actions':{hi:'तीन आसान काम',pa:'ਤਿੰਨ ਸੌਖੇ ਕੰਮ',hr:'तीन आसान काम',mr:'तीन सोप्या कृती',or:'ତିନୋଟି ସହଜ କାମ'},
  'Current crop':{hi:'वर्तमान फसल',pa:'ਮੌਜੂਦਾ ਫਸਲ',hr:'मौजूदा फसल',mr:'सध्याचे पीक',or:'ବର୍ତ୍ତମାନ ଫସଲ'},
  'Farmer choice preserved':{hi:'किसान की पसंद सुरक्षित',pa:'ਕਿਸਾਨ ਦੀ ਚੋਣ ਬਰਕਰਾਰ',hr:'किसान की पसंद कायम',mr:'शेतकऱ्याची निवड कायम',or:'ଚାଷୀଙ୍କ ପସନ୍ଦ ବଜାୟ'},
  'Open crop plan':{hi:'फसल योजना खोलें',pa:'ਫਸਲ ਯੋਜਨਾ ਖੋਲ੍ਹੋ',hr:'फसल योजना खोलो',mr:'पीक योजना उघडा',or:'ଫସଲ ଯୋଜନା ଖୋଲନ୍ତୁ'},
  'Your selling journey':{hi:'आपकी बिक्री यात्रा',pa:'ਤੁਹਾਡੀ ਵਿਕਰੀ ਯਾਤਰਾ',hr:'थारी बिक्री यात्रा',mr:'तुमचा विक्री प्रवास',or:'ଆପଣଙ୍କ ବିକ୍ରୟ ଯାତ୍ରା'},
  'Farm profile connected':{hi:'खेत प्रोफ़ाइल जुड़ी है',pa:'ਖੇਤ ਪ੍ਰੋਫਾਈਲ ਜੁੜੀ ਹੈ',hr:'खेत प्रोफाइल जुड़ी सै',mr:'शेत प्रोफाइल जोडले आहे',or:'ଚାଷ ପ୍ରୋଫାଇଲ ସଂଯୁକ୍ତ'},
  'Secure sign in':{hi:'सुरक्षित साइन इन',pa:'ਸੁਰੱਖਿਅਤ ਸਾਈਨ ਇਨ',hr:'सुरक्षित साइन इन',mr:'सुरक्षित साइन इन',or:'ସୁରକ୍ଷିତ ସାଇନ୍ ଇନ'},
  'Opening your workspace…':{hi:'आपका कार्यक्षेत्र खुल रहा है…',pa:'ਤੁਹਾਡਾ ਵਰਕਸਪੇਸ ਖੁੱਲ ਰਿਹਾ ਹੈ…',hr:'थारा काम का हिस्सा खुल रहा सै…',mr:'तुमचे कार्यक्षेत्र उघडत आहे…',or:'ଆପଣଙ୍କ କାର୍ଯ୍ୟକ୍ଷେତ୍ର ଖୋଲୁଛି…'}
});

Object.assign(extras, {
  'Global Agronomy Network':{hi:'वैश्विक कृषि विज्ञान नेटवर्क'},
  'Over 1.2 million hectares actively monitored with zero data downtime.':{hi:'12 लाख हेक्टेयर से अधिक कृषि भूमि की बिना किसी डेटा रुकावट के निगरानी की जा रही है।'},
  '+28% Avg Yield Lift':{hi:'औसत उपज में 28% वृद्धि'},
  '-35% Input Waste':{hi:'कृषि सामग्री की बर्बादी में 35% कमी'},
  'Precision Agronomy':{hi:'सटीक कृषि विज्ञान'},
  'Verified Demand':{hi:'सत्यापित माँग'},
  'Smart Logistics':{hi:'कुशल परिवहन'},
  'Fleet Efficiency':{hi:'वाहन दक्षता'},
  'Enterprise Buyer':{hi:'संस्थागत खरीदार'},
  'Fintech Credit':{hi:'डिजिटल कृषि ऋण'},
  '+38% Energy Savings':{hi:'ऊर्जा खर्च में 38% बचत'},
  '100% Pre-Sold Harvest':{hi:'पूरी उपज की अग्रिम बिक्री'},
  '-44% Freight Cost':{hi:'ढुलाई खर्च में 44% कमी'},
  '94% Trailer Utilization':{hi:'वाहन क्षमता का 94% उपयोग'},
  '$3.4M Direct Volume':{hi:'34 लाख डॉलर का सीधा कारोबार'},
  '98.2% Repayment Rate':{hi:'98.2% समय पर ऋण भुगतान'},
  'AgriOptimaᴬᴵ cut our irrigation energy bill by 38% in the first season while improving fruit brix sugar levels consistently across all blocks with zero manual guesswork.':{hi:'AgriOptimaᴬᴵ की मदद से पहले ही मौसम में सिंचाई की ऊर्जा लागत 38% घटी और बिना अनुमान लगाए पूरे खेत में फलों की मिठास बेहतर हुई।'},
  'The forward contract matching enabled us to secure buyers 4 months before harvest at a guaranteed price, removing speculative volatility and price collapse risks.':{hi:'अग्रिम अनुबंध मिलान से हमें कटाई से चार महीने पहले तय भाव पर खरीदार मिले और भाव गिरने का जोखिम कम हुआ।'},
  'Multi-farmer load aggregation grouped our small daily lettuce harvests into single refrigerated trucks. Our transport cost plummeted by 44% immediately.':{hi:'कई किसानों की छोटी दैनिक उपज को एक शीतित वाहन में भेजने से हमारा परिवहन खर्च तुरंत 44% घट गया।'},
  'Having verified dispatch freshness timestamps and dual-gate AI inspection logs before trucks arrive gives our procurement teams total operational certainty.':{hi:'वाहन पहुँचने से पहले सत्यापित ताज़गी समय और दोनों सिरों की AI जाँच मिलने से हमारी खरीद टीम सही निर्णय ले पाती है।'},
  'Vehicle capacity matching algorithm eliminated 32% of dead-head miles. We fill our reefer trailers to 94% capacity across every multi-stop farm pickup.':{hi:'वाहन क्षमता मिलान से खाली चलने वाली दूरी 32% घटी और हर बहु-खेत संग्रह में शीतित वाहन 94% तक भरते हैं।'},
  'Today on my farm':{hi:'आज मेरे खेत पर'},
  'Simple actions for the crop you already grow, selling price, orders, and payment.':{hi:'आपकी मौजूदा फसल, बिक्री भाव, ऑर्डर और भुगतान के लिए आसान कदम।'},
  'Connected farmer data':{hi:'जुड़ा हुआ किसान डेटा'},
  'Review farms or help several farmers through an FPO or assisted operator.':{hi:'खेतों की जानकारी देखें या FPO के माध्यम से कई किसानों की सहायता करें।'},
  'My current crop plan':{hi:'मेरी मौजूदा फसल की योजना'},
  'Keep your crop choice and get practical guidance for this season. Other crops are optional next-season ideas.':{hi:'अपनी चुनी हुई फसल जारी रखें और इस मौसम के लिए व्यावहारिक सलाह पाएँ। दूसरी फसलें केवल अगले मौसम के वैकल्पिक सुझाव हैं।'},
  'Soil and fertilizer guidance':{hi:'मिट्टी और उर्वरक की सलाह'},
  'Soil values load automatically. See what is missing, when to act, and choose one suitable fertilizer option.':{hi:'मिट्टी के आँकड़े अपने आप भर जाते हैं। कमी पहचानें, सही समय जानें और उपयुक्त उर्वरक चुनें।'},
  'Prices and produce listing':{hi:'भाव और उपज की बिक्री सूची'},
  'Compare recent mandi references, estimated transport, and buyer-ready listing prices.':{hi:'हाल के मंडी भाव, अनुमानित ढुलाई खर्च और खरीदार के लिए उचित बिक्री भाव की तुलना करें।'},
  'Profile status':{hi:'प्रोफ़ाइल की स्थिति'},
  'Preferred language':{hi:'पसंदीदा भाषा'},
  'Primary goal':{hi:'मुख्य लक्ष्य'},
  'Risk preference':{hi:'जोखिम की पसंद'},
  'Current crop':{hi:'मौजूदा फसल'},
  'Irrigation':{hi:'सिंचाई का प्रकार'},
  'Farmers in the same area':{hi:'इसी क्षेत्र के किसान'},
  'What does my soil need?':{hi:'मेरी मिट्टी को किस पोषक तत्व की आवश्यकता है?'},
  'You do not need to enter N, P, or K. We use the connected Soil Health Card or area estimate and turn it into practical actions for Orange (Kinnow).':{hi:'आपको N, P या K भरने की आवश्यकता नहीं है। जुड़े हुए मृदा स्वास्थ्य कार्ड या क्षेत्रीय अनुमान के आधार पर किन्नू के लिए उपयोगी सलाह दी जाती है।'},
  'Use my Soil Health Card':{hi:'मेरा मृदा स्वास्थ्य कार्ड इस्तेमाल करें'},
  'Upload a photo or PDF. Draft values are never treated as measurements until you confirm them.':{hi:'फोटो या PDF अपलोड करें। आपकी पुष्टि के बिना निकाले गए आँकड़ों को अंतिम माप नहीं माना जाएगा।'},
  'Upload card':{hi:'मृदा स्वास्थ्य कार्ड अपलोड करें'},
  'Enough for planning':{hi:'योजना के लिए पर्याप्त'},
  'Needs attention':{hi:'सुधार की आवश्यकता'},
  'See technical soil values (advanced)':{hi:'तकनीकी मृदा आँकड़े देखें (उन्नत)'},
  'Choose one fertilizer option':{hi:'उपयुक्त उर्वरक विकल्प चुनें'},
  'List produce for buyers':{hi:'खरीदारों के लिए उपज सूचीबद्ध करें'},
  'Set the produce, available quantity, price, grade, and an optional real image.':{hi:'उपज, उपलब्ध मात्रा, भाव, ग्रेड और चाहें तो वास्तविक फोटो जोड़ें।'},
  'My active listings':{hi:'मेरी सक्रिय बिक्री सूचियाँ'},
  'Latest local selling guidance':{hi:'नवीनतम स्थानीय बिक्री सलाह'},
  'Market range':{hi:'मंडी भाव की सीमा'},
  'Suggested listing range':{hi:'सुझाई गई बिक्री भाव सीमा'},
  'Suggested price':{hi:'सुझाया गया भाव'},
  'Estimated transport and fees (₹/kg)':{hi:'अनुमानित ढुलाई और शुल्क (₹/किलो)'}
});

// These cards used to fall through to individual-word replacement, producing
// mixed strings such as "Smart परिवहन & Load Aggregation". Keep complete UI
// phrases here so each selected language receives a natural, complete sentence.
Object.assign(extras, {
  'Closed-Loop Journey View':{hi:'संपूर्ण कृषि यात्रा का दृश्य',pa:'ਪੂਰੀ ਖੇਤੀ ਯਾਤਰਾ ਦਾ ਦ੍ਰਿਸ਼',hr:'पूरी खेती यात्रा का नजारा',mr:'संपूर्ण शेती प्रवास दृश्य',or:'ସମ୍ପୂର୍ଣ୍ଣ କୃଷି ଯାତ୍ରା ଦୃଶ୍ୟ'},
  'End-to-End Ag Lifecycle':{hi:'शुरुआत से अंत तक कृषि चक्र',pa:'ਸ਼ੁਰੂ ਤੋਂ ਅੰਤ ਤੱਕ ਖੇਤੀ ਚੱਕਰ',hr:'शुरू तै आखिर तक खेती चक्र',mr:'सुरुवातीपासून शेवटपर्यंत कृषी चक्र',or:'ଆରମ୍ଭରୁ ଶେଷ ପର୍ଯ୍ୟନ୍ତ କୃଷି ଚକ୍ର'},
  'Digital Produce Passport':{hi:'डिजिटल उपज पासपोर्ट',pa:'ਡਿਜ਼ਿਟਲ ਉਪਜ ਪਾਸਪੋਰਟ',hr:'डिजिटल उपज पासपोर्ट',mr:'डिजिटल उत्पादन पासपोर्ट',or:'ଡିଜିଟାଲ ଉତ୍ପାଦ ପାସପୋର୍ଟ'},
  'Quality AI & Verification':{hi:'एआई गुणवत्ता और सत्यापन',pa:'ਏਆਈ ਗੁਣਵੱਤਾ ਅਤੇ ਤਸਦੀਕ',hr:'एआई गुणवत्ता अर जांच',mr:'एआय गुणवत्ता आणि पडताळणी',or:'ଏଆଇ ଗୁଣବତ୍ତା ଓ ଯାଞ୍ଚ'},
  'Procurement Credit Intelligence':{hi:'खरीद ऋण विश्लेषण',pa:'ਖਰੀਦ ਕਰਜ਼ਾ ਵਿਸ਼ਲੇਸ਼ਣ',hr:'खरीद उधार की समझ',mr:'खरेदी पत विश्लेषण',or:'କ୍ରୟ ଋଣ ବିଶ୍ଳେଷଣ'},
  'Fintech & Risk Scoring':{hi:'वित्तीय तकनीक और जोखिम आकलन',pa:'ਵਿੱਤੀ ਤਕਨੀਕ ਅਤੇ ਜੋਖਮ ਮੁਲਾਂਕਣ',hr:'वित्त तकनीक अर जोखिम आकलन',mr:'वित्तीय तंत्रज्ञान आणि जोखीम मूल्यांकन',or:'ଆର୍ଥିକ ପ୍ରଯୁକ୍ତି ଓ ବିପଦ ମୂଲ୍ୟାଙ୍କନ'},
  'Smart Logistics & Load Aggregation':{hi:'सुव्यवस्थित परिवहन और साझा माल ढुलाई',pa:'ਸੁਚੱਜੀ ਆਵਾਜਾਈ ਅਤੇ ਸਾਂਝੀ ਮਾਲ ਢੁਆਈ',hr:'समझदार ढुलाई अर साझा माल व्यवस्था',mr:'सुव्यवस्थित वाहतूक आणि एकत्रित मालवाहतूक',or:'ସୁବ୍ୟବସ୍ଥିତ ପରିବହନ ଓ ମିଳିତ ମାଲ ପରିବହନ'},
  'Multi-Farmer Freight Optimization':{hi:'कई किसानों के लिए किफायती माल ढुलाई',pa:'ਕਈ ਕਿਸਾਨਾਂ ਲਈ ਕਿਫਾਇਤੀ ਮਾਲ ਢੁਆਈ',hr:'कई किसानां खातर सस्ती माल ढुलाई',mr:'अनेक शेतकऱ्यांसाठी किफायतशीर मालवाहतूक',or:'ଏକାଧିକ ଚାଷୀଙ୍କ ପାଇଁ ସୁଲଭ ମାଲ ପରିବହନ'},
  'Predictive Growth & Outcome Intelligence':{hi:'उपज और परिणाम का पूर्वानुमान',pa:'ਉਪਜ ਅਤੇ ਨਤੀਜਿਆਂ ਦੀ ਭਵਿੱਖਬਾਣੀ',hr:'उपज अर नतीजे का पूर्वानुमान',mr:'उत्पादन आणि परिणामांचा अंदाज',or:'ଉତ୍ପାଦନ ଓ ଫଳାଫଳ ପୂର୍ବାନୁମାନ'},
  'Yield & Market Foresight':{hi:'उपज और बाज़ार का पूर्वानुमान',pa:'ਉਪਜ ਅਤੇ ਮੰਡੀ ਦੀ ਭਵਿੱਖਬਾਣੀ',hr:'उपज अर बाजार का अंदाजा',mr:'उत्पादन आणि बाजाराचा अंदाज',or:'ଉତ୍ପାଦନ ଓ ବଜାର ପୂର୍ବାନୁମାନ'},
  'Connected System':{hi:'जुड़ी हुई व्यवस्था',pa:'ਜੁੜੀ ਹੋਈ ਪ੍ਰਣਾਲੀ',hr:'जुड़ी व्यवस्था',mr:'जोडलेली व्यवस्था',or:'ସଂଯୁକ୍ତ ବ୍ୟବସ୍ଥା'},
  'Pause auto-rotation':{hi:'स्वचालित बदलाव रोकें',pa:'ਆਪਣੇ ਆਪ ਬਦਲਣਾ ਰੋਕੋ',hr:'अपने आप बदलणा रोको',mr:'स्वयंचलित बदल थांबवा',or:'ସ୍ୱୟଂଚାଳିତ ପରିବର୍ତ୍ତନ ବନ୍ଦ କରନ୍ତୁ'},
  'Resume auto-rotation':{hi:'स्वचालित बदलाव फिर चलाएँ',pa:'ਆਪਣੇ ਆਪ ਬਦਲਣਾ ਮੁੜ ਚਲਾਓ',hr:'अपने आप बदलणा फेर चालू करो',mr:'स्वयंचलित बदल पुन्हा सुरू करा',or:'ସ୍ୱୟଂଚାଳିତ ପରିବର୍ତ୍ତନ ପୁଣି ଚାଲୁ କରନ୍ତୁ'}
});

const vocabulary:Partial<Record<LanguageCode,Record<string,string>>>={
 hi:{automatic:'स्वचालित',soil:'मिट्टी',health:'स्वास्थ्य',intelligence:'बुद्धिमत्ता',area:'क्षेत्र',regional:'क्षेत्रीय',baseline:'आधार मान',common:'सामान्य',values:'मान',district:'जिला',nutrient:'पोषक तत्व',nutrients:'पोषक तत्व',nitrogen:'नाइट्रोजन',phosphorus:'फॉस्फोरस',potassium:'पोटैशियम',missing:'कमी',sufficient:'पर्याप्त',moderate:'मध्यम',low:'कम',target:'लक्ष्य',recommended:'अनुशंसित',fertilizer:'उर्वरक',plan:'योजना',farmer:'किसान',farm:'खेत',buyer:'खरीदार',buyers:'खरीदार',produce:'उपज',listing:'सूची',listings:'सूचियाँ',marketplace:'बाज़ार',price:'मूल्य',quantity:'मात्रा',available:'उपलब्ध',remove:'हटाएँ',publish:'प्रकाशित करें',image:'चित्र',grade:'ग्रेड',order:'ऑर्डर',orders:'ऑर्डर',shipment:'शिपमेंट',shipments:'शिपमेंट',shipped:'भेजा गया',pending:'लंबित',transit:'रास्ते में',status:'स्थिति',current:'वर्तमान',active:'सक्रिय',total:'कुल',freshness:'ताज़गी',credit:'ऋण',supplier:'आपूर्तिकर्ता',suppliers:'आपूर्तिकर्ता',logistics:'परिवहन',tracking:'ट्रैकिंग',digital:'डिजिटल',passport:'पासपोर्ट',verified:'सत्यापित',open:'खोलें',close:'बंद करें',back:'वापस',search:'खोजें',select:'चुनें',create:'बनाएँ',profile:'प्रोफ़ाइल',overview:'अवलोकन',recommendation:'सुझाव',crop:'फसल',delivery:'वितरण',today:'आज',tomorrow:'कल',loading:'लोड हो रहा है',save:'सहेजें',cancel:'रद्द करें',upload:'अपलोड करें',received:'प्राप्त',quality:'गुणवत्ता',score:'स्कोर',risk:'जोखिम',location:'स्थान',details:'विवरण',name:'नाम',language:'भाषा'},
 mr:{automatic:'स्वयंचलित',soil:'माती',health:'आरोग्य',intelligence:'बुद्धिमत्ता',area:'क्षेत्र',regional:'प्रादेशिक',baseline:'मूलभूत मान',common:'सामान्य',values:'मूल्ये',district:'जिल्हा',nutrient:'पोषक घटक',nutrients:'पोषक घटक',nitrogen:'नायट्रोजन',phosphorus:'फॉस्फरस',potassium:'पोटॅशियम',missing:'कमतरता',sufficient:'पुरेसे',moderate:'मध्यम',low:'कमी',target:'लक्ष्य',recommended:'शिफारस केलेले',fertilizer:'खत',plan:'योजना',farmer:'शेतकरी',farm:'शेत',buyer:'खरेदीदार',buyers:'खरेदीदार',produce:'उत्पादन',listing:'सूची',listings:'सूची',marketplace:'बाजारपेठ',price:'किंमत',quantity:'प्रमाण',available:'उपलब्ध',remove:'काढा',publish:'प्रकाशित करा',image:'प्रतिमा',grade:'दर्जा',order:'ऑर्डर',orders:'ऑर्डर',shipment:'मालवाहतूक',shipments:'मालवाहतूक',shipped:'पाठवले',pending:'प्रलंबित',transit:'मार्गावर',status:'स्थिती',current:'सध्याचे',active:'सक्रिय',total:'एकूण',freshness:'ताजेपणा',credit:'पत',supplier:'पुरवठादार',suppliers:'पुरवठादार',logistics:'वाहतूक',tracking:'मागोवा',digital:'डिजिटल',passport:'पासपोर्ट',verified:'सत्यापित',open:'उघडा',close:'बंद करा',back:'मागे',search:'शोधा',select:'निवडा',create:'तयार करा',profile:'प्रोफाइल',overview:'आढावा',recommendation:'शिफारस',crop:'पीक',delivery:'वितरण',today:'आज',tomorrow:'उद्या',loading:'लोड होत आहे',save:'जतन करा',cancel:'रद्द करा',upload:'अपलोड करा',received:'प्राप्त',quality:'गुणवत्ता',score:'गुण',risk:'जोखीम',location:'स्थान',details:'तपशील',name:'नाव',language:'भाषा'},
 pa:{soil:'ਮਿੱਟੀ',health:'ਸਿਹਤ',automatic:'ਆਟੋਮੈਟਿਕ',intelligence:'ਜਾਣਕਾਰੀ',area:'ਖੇਤਰ',district:'ਜ਼ਿਲ੍ਹਾ',nutrients:'ਪੋਸ਼ਕ ਤੱਤ',nitrogen:'ਨਾਈਟ੍ਰੋਜਨ',phosphorus:'ਫਾਸਫੋਰਸ',potassium:'ਪੋਟਾਸ਼ੀਅਮ',missing:'ਕਮੀ',recommended:'ਸਿਫਾਰਸ਼ੀ',fertilizer:'ਖਾਦ',plan:'ਯੋਜਨਾ',farmer:'ਕਿਸਾਨ',farm:'ਖੇਤ',buyer:'ਖਰੀਦਦਾਰ',produce:'ਉਪਜ',listing:'ਸੂਚੀ',listings:'ਸੂਚੀਆਂ',marketplace:'ਮਾਰਕੀਟ',price:'ਕੀਮਤ',quantity:'ਮਾਤਰਾ',available:'ਉਪਲਬਧ',remove:'ਹਟਾਓ',publish:'ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ',image:'ਤਸਵੀਰ',grade:'ਗ੍ਰੇਡ',orders:'ਆਰਡਰ',shipments:'ਖੇਪਾਂ',pending:'ਬਕਾਇਆ',status:'ਸਥਿਤੀ',active:'ਸਰਗਰਮ',freshness:'ਤਾਜ਼ਗੀ',credit:'ਕਰਜ਼ਾ',suppliers:'ਸਪਲਾਇਰ',logistics:'ਆਵਾਜਾਈ',tracking:'ਟਰੈਕਿੰਗ',passport:'ਪਾਸਪੋਰਟ',verified:'ਪ੍ਰਮਾਣਿਤ',open:'ਖੋਲ੍ਹੋ',close:'ਬੰਦ ਕਰੋ',search:'ਖੋਜੋ',select:'ਚੁਣੋ',profile:'ਪ੍ਰੋਫਾਈਲ',overview:'ਸੰਖੇਪ',recommendation:'ਸਿਫਾਰਸ਼',crop:'ਫਸਲ',delivery:'ਡਿਲਿਵਰੀ',today:'ਅੱਜ',tomorrow:'ਕੱਲ੍ਹ',upload:'ਅਪਲੋਡ ਕਰੋ',quality:'ਗੁਣਵੱਤਾ',score:'ਸਕੋਰ',risk:'ਜੋਖਮ',location:'ਸਥਾਨ',details:'ਵੇਰਵੇ',language:'ਭਾਸ਼ਾ'},
 hr:{soil:'मिट्टी',health:'सेहत',automatic:'अपने आप',intelligence:'समझ',area:'इलाका',district:'जिला',nutrients:'पोषक तत्व',nitrogen:'नाइट्रोजन',phosphorus:'फॉस्फोरस',potassium:'पोटाश',missing:'कमी',recommended:'सुझाया गया',fertilizer:'खाद',plan:'योजना',farmer:'किसान',farm:'खेत',buyer:'खरीदार',produce:'उपज',listing:'लिस्ट',listings:'लिस्ट',marketplace:'बाजार',price:'भाव',quantity:'मात्रा',available:'मौजूद',remove:'हटाओ',publish:'जारी करो',image:'फोटो',grade:'ग्रेड',orders:'ऑर्डर',shipments:'खेप',pending:'बाकी',status:'हालत',active:'चालू',freshness:'ताजगी',credit:'उधार',suppliers:'सप्लायर',logistics:'ढुलाई',tracking:'निगरानी',passport:'पासपोर्ट',verified:'सत्यापित',open:'खोलो',close:'बंद करो',search:'खोजो',select:'चुनो',profile:'प्रोफाइल',overview:'जायजा',recommendation:'सलाह',crop:'फसल',delivery:'डिलीवरी',today:'आज',tomorrow:'कल',upload:'अपलोड करो',quality:'गुणवत्ता',score:'स्कोर',risk:'जोखिम',location:'जगह',details:'जानकारी',language:'भाषा'},
 or:{soil:'ମାଟି',health:'ସ୍ୱାସ୍ଥ୍ୟ',automatic:'ସ୍ୱୟଂଚାଳିତ',intelligence:'ବୁଦ୍ଧିମତା',area:'ଅଞ୍ଚଳ',district:'ଜିଲ୍ଲା',nutrients:'ପୋଷକ',nitrogen:'ନାଇଟ୍ରୋଜେନ',phosphorus:'ଫସଫରସ',potassium:'ପୋଟାସିୟମ',missing:'ଅଭାବ',recommended:'ସୁପାରିଶ',fertilizer:'ସାର',plan:'ଯୋଜନା',farmer:'ଚାଷୀ',farm:'ଚାଷ ଜମି',buyer:'କ୍ରେତା',produce:'ଉତ୍ପାଦ',listing:'ତାଲିକା',listings:'ତାଲିକା',marketplace:'ବଜାର',price:'ମୂଲ୍ୟ',quantity:'ପରିମାଣ',available:'ଉପଲବ୍ଧ',remove:'ହଟାନ୍ତୁ',publish:'ପ୍ରକାଶ କରନ୍ତୁ',image:'ଛବି',grade:'ଗ୍ରେଡ୍',orders:'ଅର୍ଡର',shipments:'ପରିବହନ',pending:'ବାକି',status:'ସ୍ଥିତି',active:'ସକ୍ରିୟ',freshness:'ସତେଜତା',credit:'ଋଣ',suppliers:'ଯୋଗାଣକାରୀ',logistics:'ପରିବହନ',tracking:'ଟ୍ରାକିଂ',passport:'ପାସପୋର୍ଟ',verified:'ଯାଞ୍ଚିତ',open:'ଖୋଲନ୍ତୁ',close:'ବନ୍ଦ କରନ୍ତୁ',search:'ଖୋଜନ୍ତୁ',select:'ବାଛନ୍ତୁ',profile:'ପ୍ରୋଫାଇଲ',overview:'ସାରାଂଶ',recommendation:'ସୁପାରିଶ',crop:'ଫସଲ',delivery:'ବିତରଣ',today:'ଆଜି',tomorrow:'ଆସନ୍ତାକାଲି',upload:'ଅପଲୋଡ୍ କରନ୍ତୁ',quality:'ଗୁଣବତ୍ତା',score:'ସ୍କୋର',risk:'ବିପଦ',location:'ସ୍ଥାନ',details:'ବିବରଣୀ',language:'ଭାଷା'}
};

const originals=new WeakMap<Node,string>();
const lastApplied=new WeakMap<Node,string>();
const attrOriginals=new WeakMap<Element,Record<string,string>>();
const attrLastApplied=new WeakMap<Element,Record<string,string>>();
const escapeRegExp=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

function dictionary(lang:LanguageCode){
  const map=new Map<string,string>();
  const english=translations.en as Record<string,unknown>;
  const target=translations[lang] as Record<string,unknown>;
  Object.keys(english).forEach((key)=>{if(typeof english[key]==='string'&&typeof target[key]==='string')map.set(english[key] as string,target[key] as string)});
  Object.entries(extras).forEach(([key,value])=>{if(value[lang])map.set(key,value[lang]!)});
  return map;
}

function restoreEnglish(value:string){
  let output=value;

  // React can reuse a text node when the language changes. Convert any text
  // from the previous language back to the single English source before the
  // next translation pass, so translations never stack on one another.
  (['hi','pa','hr','mr','or'] as LanguageCode[]).forEach((sourceLanguage)=>{
    const reverse=[...dictionary(sourceLanguage).entries()]
      .filter(([english,translated])=>english!==translated)
      .sort((a,b)=>b[1].length-a[1].length);
    reverse.forEach(([english,translated])=>{
      output=output.replace(new RegExp(escapeRegExp(translated),'g'),english);
    });

    const reverseWords=Object.entries(vocabulary[sourceLanguage]||{})
      .sort((a,b)=>b[1].length-a[1].length);
    reverseWords.forEach(([english,translated])=>{
      output=output.replace(new RegExp(escapeRegExp(translated),'g'),english);
    });
  });
  return output;
}

function translateValue(value:string,map:Map<string,string>,lang:LanguageCode){
  if(lang==='en')return value;
  const trimmed=value.trim(); const exact=map.get(trimmed);
  if(exact)return value.replace(trimmed,exact);
  if(lang==='hi'){
    const patterns:Array<[RegExp,(match:RegExpMatchArray)=>string]>=[
      [/^Keep growing (.+)\.$/,m=>`${m[1]} की खेती जारी रखें।`],
      [/^Open my (.+) plan$/,m=>`${m[1]} की मेरी योजना खोलें`],
      [/^(.+) market guidance$/,m=>`${m[1]} के मंडी भाव की सलाह`],
      [/^Other farmers near (.+)$/,m=>`${m[1]} के आसपास के अन्य किसान`],
      [/^Your (.+) plan will appear here$/,m=>`${m[1]} की आपकी योजना यहाँ दिखाई जाएगी`],
      [/^(\d+) active buyer listing$/,m=>`${m[1]} सक्रिय खरीदार सूची`],
      [/^(\d+) active buyer listings$/,m=>`${m[1]} सक्रिय खरीदार सूचियाँ`],
    ];
    for(const [pattern,replacement] of patterns){const match=trimmed.match(pattern);if(match)return value.replace(trimmed,replacement(match));}
  }
  // Never translate isolated words inside an otherwise untranslated sentence.
  // A missing phrase remains readable English until a reviewed full translation
  // is added, instead of producing confusing mixed-language text.
  return value;
}

function apply(root:Document|ShadowRoot,lang:LanguageCode){
  const map=dictionary(lang); const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node:Node|null;
  while((node=walker.nextNode())){const parent=node.parentElement;if(!parent||parent.closest('.global-language-dock,[data-i18n-native]')||['SCRIPT','STYLE'].includes(parent.tagName))continue;const current=node.textContent||'';if(!originals.has(node)||(lastApplied.has(node)&&current!==lastApplied.get(node)))originals.set(node,restoreEnglish(current));const original=originals.get(node)||'';const next=translateValue(original,map,lang);if(current!==next)node.textContent=next;lastApplied.set(node,next)}
  root.querySelectorAll('input,textarea,button,[aria-label],[title]').forEach((element)=>{if(element.closest('.global-language-dock,[data-i18n-native]'))return;let saved=attrOriginals.get(element);let applied=attrLastApplied.get(element);if(!saved){saved={};attrOriginals.set(element,saved)}if(!applied){applied={};attrLastApplied.set(element,applied)};['placeholder','aria-label','title','value'].forEach((attr)=>{const current=element.getAttribute(attr);if(current&&(!saved![attr]||current!==applied![attr]))saved![attr]=restoreEnglish(current);if(saved![attr]){const next=translateValue(saved![attr],map,lang);if(current!==next)element.setAttribute(attr,next);applied![attr]=next}})});
}

export function GlobalTranslation({ showSelector }:{showSelector:boolean}){
  const {language}=useLanguage();
  useEffect(()=>{let timer=0;const run=()=>{apply(document,language);document.querySelectorAll<HTMLElement>('.buyer-exact-host').forEach((host)=>{if(host.shadowRoot)apply(host.shadowRoot,language)})};run();const observer=new MutationObserver(()=>{window.clearTimeout(timer);timer=window.setTimeout(run,30)});observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title']});const dynamicWindowCheck=window.setInterval(run,300);return()=>{observer.disconnect();window.clearTimeout(timer);window.clearInterval(dynamicWindowCheck)}},[language,showSelector]);
  return showSelector?<div className="global-language-dock"><LanguageSelector isScrolled={true}/></div>:null;
}
