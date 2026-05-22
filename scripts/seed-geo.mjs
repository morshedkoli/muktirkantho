import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GEO = [
  {
    name: "ঢাকা", slug: "dhaka",
    districts: [
      { name: "ঢাকা", slug: "dhaka", upazilas: [
        { name: "ধামরাই", slug: "dhamrai" }, { name: "দোহার", slug: "dohar" },
        { name: "কেরানীগঞ্জ", slug: "keraniganj" }, { name: "নবাবগঞ্জ", slug: "nawabganj" },
        { name: "সাভার", slug: "savar" },
      ]},
      { name: "ফরিদপুর", slug: "faridpur", upazilas: [
        { name: "আলফাডাঙ্গা", slug: "alfadanga" }, { name: "ভাঙ্গা", slug: "bhanga" },
        { name: "বোয়ালমারী", slug: "boalmari" }, { name: "চরভদ্রাসন", slug: "char-bhadrasan" },
        { name: "ফরিদপুর সদর", slug: "faridpur-sadar" }, { name: "মধুখালী", slug: "madhukhali" },
        { name: "নগরকান্দা", slug: "nagarkanda" }, { name: "সদরপুর", slug: "sadarpur" },
        { name: "সালথা", slug: "saltha" },
      ]},
      { name: "গাজীপুর", slug: "gazipur", upazilas: [
        { name: "কালিয়াকৈর", slug: "kaliakair" }, { name: "কালীগঞ্জ", slug: "kaliganj-gazipur" },
        { name: "কাপাসিয়া", slug: "kapasia" }, { name: "গাজীপুর সদর", slug: "gazipur-sadar" },
        { name: "শ্রীপুর", slug: "sreepur-gazipur" },
      ]},
      { name: "গোপালগঞ্জ", slug: "gopalganj", upazilas: [
        { name: "কাশিয়ানী", slug: "kashiani" }, { name: "কোটালীপাড়া", slug: "kotalipara" },
        { name: "মুকসুদপুর", slug: "muksudpur" }, { name: "গোপালগঞ্জ সদর", slug: "gopalganj-sadar" },
        { name: "টুঙ্গিপাড়া", slug: "tungipara" },
      ]},
      { name: "কিশোরগঞ্জ", slug: "kishoreganj", upazilas: [
        { name: "অষ্টগ্রাম", slug: "austagram" }, { name: "বাজিতপুর", slug: "bajitpur" },
        { name: "ভৈরব", slug: "bhairab" }, { name: "হোসেনপুর", slug: "hossainpur" },
        { name: "ইটনা", slug: "itna" }, { name: "করিমগঞ্জ", slug: "karimganj" },
        { name: "কটিয়াদী", slug: "katiadi" }, { name: "কিশোরগঞ্জ সদর", slug: "kishoreganj-sadar" },
        { name: "কুলিয়ারচর", slug: "kuliarchar" }, { name: "মিঠামইন", slug: "mithamain" },
        { name: "নিকলী", slug: "nikli" }, { name: "পাকুন্দিয়া", slug: "pakundia" },
        { name: "তাড়াইল", slug: "tarail" },
      ]},
      { name: "মাদারীপুর", slug: "madaripur", upazilas: [
        { name: "কালকিনি", slug: "kalkini" }, { name: "মাদারীপুর সদর", slug: "madaripur-sadar" },
        { name: "রাজৈর", slug: "rajoir" }, { name: "শিবচর", slug: "shibchar" },
      ]},
      { name: "মানিকগঞ্জ", slug: "manikganj", upazilas: [
        { name: "দৌলতপুর", slug: "daulatpur-manikganj" }, { name: "ঘিওর", slug: "ghior" },
        { name: "হরিরামপুর", slug: "harirampur" }, { name: "মানিকগঞ্জ সদর", slug: "manikganj-sadar" },
        { name: "সাটুরিয়া", slug: "saturia" }, { name: "শিবালয়", slug: "shibalaya" },
        { name: "সিংগাইর", slug: "singair" },
      ]},
      { name: "মুন্সিগঞ্জ", slug: "munshiganj", upazilas: [
        { name: "গজারিয়া", slug: "gazaria" }, { name: "লৌহজং", slug: "louhajang" },
        { name: "মুন্সিগঞ্জ সদর", slug: "munshiganj-sadar" }, { name: "শ্রীনগর", slug: "sreenagar" },
        { name: "সিরাজদিখান", slug: "sirajdikhan" }, { name: "টঙ্গীবাড়ী", slug: "tongibari" },
      ]},
      { name: "নারায়ণগঞ্জ", slug: "narayanganj", upazilas: [
        { name: "আড়াইহাজার", slug: "araihazar" }, { name: "বন্দর", slug: "bandar" },
        { name: "নারায়ণগঞ্জ সদর", slug: "narayanganj-sadar" }, { name: "রূপগঞ্জ", slug: "rupganj" },
        { name: "সোনারগাঁও", slug: "sonargaon" },
      ]},
      { name: "নরসিংদী", slug: "narsingdi", upazilas: [
        { name: "বেলাব", slug: "belabo" }, { name: "মনোহরদী", slug: "monohardi" },
        { name: "নরসিংদী সদর", slug: "narsingdi-sadar" }, { name: "পলাশ", slug: "palash" },
        { name: "রায়পুরা", slug: "raipura" }, { name: "শিবপুর", slug: "shibpur" },
      ]},
      { name: "রাজবাড়ী", slug: "rajbari", upazilas: [
        { name: "বালিয়াকান্দি", slug: "baliakandi" }, { name: "গোয়ালন্দ", slug: "goalanda" },
        { name: "কালুখালী", slug: "kalukhali" }, { name: "পাংশা", slug: "pangsha" },
        { name: "রাজবাড়ী সদর", slug: "rajbari-sadar" },
      ]},
      { name: "শরীয়তপুর", slug: "shariatpur", upazilas: [
        { name: "ভেদরগঞ্জ", slug: "bhedarganj" }, { name: "দামুদ্যা", slug: "damudya" },
        { name: "গোসাইরহাট", slug: "gosairhat" }, { name: "জাজিরা", slug: "jajira" },
        { name: "নড়িয়া", slug: "naria" }, { name: "শরীয়তপুর সদর", slug: "shariatpur-sadar" },
      ]},
      { name: "টাঙ্গাইল", slug: "tangail", upazilas: [
        { name: "বাসাইল", slug: "basail" }, { name: "ভূয়াপুর", slug: "bhuapur" },
        { name: "দেলদুয়ার", slug: "delduar" }, { name: "ধনবাড়ী", slug: "dhanbari" },
        { name: "ঘাটাইল", slug: "ghatail" }, { name: "গোপালপুর", slug: "gopalpur-tangail" },
        { name: "কালিহাতী", slug: "kalihati" }, { name: "মধুপুর", slug: "madhupur" },
        { name: "মির্জাপুর", slug: "mirzapur" }, { name: "নাগরপুর", slug: "nagarpur" },
        { name: "সখিপুর", slug: "sakhipur" }, { name: "টাঙ্গাইল সদর", slug: "tangail-sadar" },
      ]},
    ],
  },
  {
    name: "চট্টগ্রাম", slug: "chittagong",
    districts: [
      { name: "বান্দরবান", slug: "bandarban", upazilas: [
        { name: "আলীকদম", slug: "alikadam" }, { name: "বান্দরবান সদর", slug: "bandarban-sadar" },
        { name: "লামা", slug: "lama" }, { name: "নাইক্ষ্যংছড়ি", slug: "naikhongchhari" },
        { name: "রোয়াংছড়ি", slug: "rowangchhari" }, { name: "রুমা", slug: "ruma" },
        { name: "থানচি", slug: "thanchi" },
      ]},
      { name: "ব্রাহ্মণবাড়িয়া", slug: "brahmanbaria", upazilas: [
        { name: "আখাউড়া", slug: "akhaura" }, { name: "বাঞ্ছারামপুর", slug: "bancharampur" },
        { name: "ব্রাহ্মণবাড়িয়া সদর", slug: "brahmanbaria-sadar" }, { name: "কসবা", slug: "kasba" },
        { name: "নাসিরনগর", slug: "nasirnagar" }, { name: "নবীনগর", slug: "nabinagar" },
        { name: "সরাইল", slug: "sarail" }, { name: "আশুগঞ্জ", slug: "ashuganj" },
        { name: "বিজয়নগর", slug: "bijoynagar" },
      ]},
      { name: "চাঁদপুর", slug: "chandpur", upazilas: [
        { name: "চাঁদপুর সদর", slug: "chandpur-sadar" }, { name: "ফরিদগঞ্জ", slug: "faridganj" },
        { name: "হাইমচর", slug: "haimchar" }, { name: "হাজীগঞ্জ", slug: "haziganj" },
        { name: "কচুয়া", slug: "kachua-chandpur" }, { name: "মতলব উত্তর", slug: "matlab-uttar" },
        { name: "মতলব দক্ষিণ", slug: "matlab-dakshin" }, { name: "শাহরাস্তি", slug: "shahrasti" },
      ]},
      { name: "চট্টগ্রাম", slug: "chittagong-district", upazilas: [
        { name: "আনোয়ারা", slug: "anowara" }, { name: "বাঁশখালী", slug: "banshkhali" },
        { name: "বোয়ালখালী", slug: "boalkhali" }, { name: "চন্দনাইশ", slug: "chandanaish" },
        { name: "ফটিকছড়ি", slug: "fatikchhari" }, { name: "হাটহাজারী", slug: "hathazari" },
        { name: "কর্ণফুলী", slug: "karnaphuli" }, { name: "লোহাগাড়া", slug: "lohagara-chittagong" },
        { name: "মিরসরাই", slug: "mirsharai" }, { name: "পটিয়া", slug: "patiya" },
        { name: "রাঙ্গুনিয়া", slug: "rangunia" }, { name: "রাউজান", slug: "raozan" },
        { name: "সন্দ্বীপ", slug: "sandwip" }, { name: "সাতকানিয়া", slug: "satkania" },
        { name: "সীতাকুণ্ড", slug: "sitakunda" },
      ]},
      { name: "কুমিল্লা", slug: "comilla", upazilas: [
        { name: "বরুড়া", slug: "barura" }, { name: "ব্রাহ্মণপাড়া", slug: "brahmanpara" },
        { name: "বুড়িচং", slug: "burichang" }, { name: "চান্দিনা", slug: "chandina" },
        { name: "চৌদ্দগ্রাম", slug: "chauddagram" }, { name: "দাউদকান্দি", slug: "daudkandi" },
        { name: "দেবীদ্বার", slug: "debidwar" }, { name: "হোমনা", slug: "homna" },
        { name: "কুমিল্লা সদর", slug: "comilla-sadar" }, { name: "লাকসাম", slug: "laksam" },
        { name: "লালমাই", slug: "lalmai" }, { name: "মেঘনা", slug: "meghna-comilla" },
        { name: "মুরাদনগর", slug: "muradnagar" }, { name: "নাঙ্গলকোট", slug: "nangalkot" },
        { name: "কুমিল্লা সদর দক্ষিণ", slug: "comilla-sadar-dakshin" },
        { name: "তিতাস", slug: "titas" }, { name: "মনোহরগঞ্জ", slug: "monoharganj" },
      ]},
      { name: "কক্সবাজার", slug: "coxs-bazar", upazilas: [
        { name: "চকরিয়া", slug: "chakaria" }, { name: "কক্সবাজার সদর", slug: "coxs-bazar-sadar" },
        { name: "কুতুবদিয়া", slug: "kutubdia" }, { name: "মহেশখালী", slug: "maheshkhali" },
        { name: "পেকুয়া", slug: "pekua" }, { name: "রামু", slug: "ramu" },
        { name: "টেকনাফ", slug: "teknaf" }, { name: "উখিয়া", slug: "ukhia" },
      ]},
      { name: "ফেনী", slug: "feni", upazilas: [
        { name: "ছাগলনাইয়া", slug: "chhagalnaiya" }, { name: "দাগনভূঞা", slug: "daganbhuiyan" },
        { name: "ফেনী সদর", slug: "feni-sadar" }, { name: "ফুলগাজী", slug: "fulgazi" },
        { name: "পরশুরাম", slug: "parshuram" }, { name: "সোনাগাজী", slug: "sonagazi" },
      ]},
      { name: "খাগড়াছড়ি", slug: "khagrachhari", upazilas: [
        { name: "দীঘিনালা", slug: "dighinala" }, { name: "খাগড়াছড়ি সদর", slug: "khagrachhari-sadar" },
        { name: "লক্ষ্মীছড়ি", slug: "lakshmichhari" }, { name: "মহালছড়ি", slug: "mahalchhari" },
        { name: "মানিকছড়ি", slug: "manikchhari" }, { name: "মাটিরাঙ্গা", slug: "matiranga" },
        { name: "পানছড়ি", slug: "panchhari" }, { name: "রামগড়", slug: "ramgarh" },
        { name: "গুইমারা", slug: "guimara" },
      ]},
      { name: "লক্ষ্মীপুর", slug: "lakshmipur", upazilas: [
        { name: "কমলনগর", slug: "kamalnagar" }, { name: "লক্ষ্মীপুর সদর", slug: "lakshmipur-sadar" },
        { name: "রামগঞ্জ", slug: "ramganj" }, { name: "রামগতি", slug: "ramgati" },
        { name: "রায়পুর", slug: "raipur-lakshmipur" },
      ]},
      { name: "নোয়াখালী", slug: "noakhali", upazilas: [
        { name: "বেগমগঞ্জ", slug: "begumganj" }, { name: "চাটখিল", slug: "chatkhil" },
        { name: "কোম্পানীগঞ্জ", slug: "companiganj-noakhali" }, { name: "হাতিয়া", slug: "hatia" },
        { name: "কবিরহাট", slug: "kabirhat" }, { name: "নোয়াখালী সদর", slug: "noakhali-sadar" },
        { name: "সেনবাগ", slug: "senbagh" }, { name: "সোনাইমুড়ী", slug: "sonaimuri" },
        { name: "সুবর্ণচর", slug: "subarnachar" },
      ]},
      { name: "রাঙামাটি", slug: "rangamati", upazilas: [
        { name: "বাঘাইছড়ি", slug: "baghaichhari" }, { name: "বরকল", slug: "barkal" },
        { name: "বিলাইছড়ি", slug: "bilaishari" }, { name: "কাপ্তাই", slug: "kaptai" },
        { name: "জুরাছড়ি", slug: "jurachhari" }, { name: "কাউখালী", slug: "kaukhali-rangamati" },
        { name: "লংগদু", slug: "langadu" }, { name: "নানিয়ারচর", slug: "naniarchar" },
        { name: "রাজস্থলী", slug: "rajasthali" }, { name: "রাঙামাটি সদর", slug: "rangamati-sadar" },
      ]},
    ],
  },
  {
    name: "রাজশাহী", slug: "rajshahi",
    districts: [
      { name: "বগুড়া", slug: "bogura", upazilas: [
        { name: "আদমদীঘি", slug: "adamdighi" }, { name: "বগুড়া সদর", slug: "bogura-sadar" },
        { name: "ধুনট", slug: "dhunat" }, { name: "দুপচাঁচিয়া", slug: "dupchanchia" },
        { name: "গাবতলী", slug: "gabtali" }, { name: "কাহালু", slug: "kahalu" },
        { name: "নন্দীগ্রাম", slug: "nandigram" }, { name: "সারিয়াকান্দি", slug: "sariakandi" },
        { name: "শাজাহানপুর", slug: "shajahanpur" }, { name: "শেরপুর", slug: "sherpur-bogura" },
        { name: "শিবগঞ্জ", slug: "shibganj-bogura" }, { name: "সোনাতলা", slug: "sonatala" },
      ]},
      { name: "চাঁপাইনবাবগঞ্জ", slug: "chapainawabganj", upazilas: [
        { name: "ভোলাহাট", slug: "bholahat" }, { name: "গোমস্তাপুর", slug: "gomastapur" },
        { name: "নাচোল", slug: "nachol" }, { name: "চাঁপাইনবাবগঞ্জ সদর", slug: "chapainawabganj-sadar" },
        { name: "শিবগঞ্জ", slug: "shibganj-chapai" },
      ]},
      { name: "জয়পুরহাট", slug: "joypurhat", upazilas: [
        { name: "আক্কেলপুর", slug: "akkelpur" }, { name: "জয়পুরহাট সদর", slug: "joypurhat-sadar" },
        { name: "কালাই", slug: "kalai" }, { name: "ক্ষেতলাল", slug: "khetlal" },
        { name: "পাঁচবিবি", slug: "panchbibi" },
      ]},
      { name: "নওগাঁ", slug: "naogaon", upazilas: [
        { name: "আত্রাই", slug: "atrai" }, { name: "বদলগাছী", slug: "badalgachhi" },
        { name: "ধামইরহাট", slug: "dhamoirhat" }, { name: "মান্দা", slug: "manda" },
        { name: "মহাদেবপুর", slug: "mahadebpur" }, { name: "নওগাঁ সদর", slug: "naogaon-sadar" },
        { name: "নিয়ামতপুর", slug: "niamatpur" }, { name: "পত্নীতলা", slug: "patnitala" },
        { name: "পোরশা", slug: "porsha" }, { name: "রানীনগর", slug: "raninagar" },
        { name: "সাপাহার", slug: "sapahar" },
      ]},
      { name: "নাটোর", slug: "natore", upazilas: [
        { name: "বড়াইগ্রাম", slug: "baraigram" }, { name: "বাগাতিপাড়া", slug: "bagatipara" },
        { name: "গুরুদাসপুর", slug: "gurudashpur" }, { name: "লালপুর", slug: "lalpur" },
        { name: "নাটোর সদর", slug: "natore-sadar" }, { name: "সিংড়া", slug: "singra" },
        { name: "নলডাঙ্গা", slug: "naldanga" },
      ]},
      { name: "পাবনা", slug: "pabna", upazilas: [
        { name: "আটঘরিয়া", slug: "atgharia" }, { name: "বেড়া", slug: "bera" },
        { name: "ভাঙ্গুড়া", slug: "bhangura" }, { name: "চাটমোহর", slug: "chatmohar" },
        { name: "ফরিদপুর", slug: "faridpur-pabna" }, { name: "ঈশ্বরদী", slug: "ishwardi" },
        { name: "পাবনা সদর", slug: "pabna-sadar" }, { name: "সাঁথিয়া", slug: "santhia" },
        { name: "সুজানগর", slug: "sujanagar" },
      ]},
      { name: "রাজশাহী", slug: "rajshahi-district", upazilas: [
        { name: "বাঘা", slug: "bagha" }, { name: "বাগমারা", slug: "bagmara" },
        { name: "চারঘাট", slug: "charghat" }, { name: "দুর্গাপুর", slug: "durgapur-rajshahi" },
        { name: "গোদাগাড়ী", slug: "godagari" }, { name: "মোহনপুর", slug: "mohanpur" },
        { name: "পবা", slug: "poba" }, { name: "পুঠিয়া", slug: "puthia" },
        { name: "তানোর", slug: "tanore" },
      ]},
      { name: "সিরাজগঞ্জ", slug: "sirajganj", upazilas: [
        { name: "বেলকুচি", slug: "belkuchi" }, { name: "চৌহালী", slug: "chauhali" },
        { name: "কামারখন্দ", slug: "kamarkhanda" }, { name: "কাজীপুর", slug: "kazipur" },
        { name: "রায়গঞ্জ", slug: "raiganj" }, { name: "শাহজাদপুর", slug: "shahjadpur" },
        { name: "সিরাজগঞ্জ সদর", slug: "sirajganj-sadar" }, { name: "তাড়াশ", slug: "tarash" },
        { name: "উল্লাপাড়া", slug: "ullapara" },
      ]},
    ],
  },
  {
    name: "খুলনা", slug: "khulna",
    districts: [
      { name: "বাগেরহাট", slug: "bagerhat", upazilas: [
        { name: "বাগেরহাট সদর", slug: "bagerhat-sadar" }, { name: "চিতলমারী", slug: "chitalmari" },
        { name: "ফকিরহাট", slug: "fakirhat" }, { name: "কচুয়া", slug: "kachua-bagerhat" },
        { name: "মোল্লাহাট", slug: "mollahat" }, { name: "মোংলা", slug: "mongla" },
        { name: "মোরেলগঞ্জ", slug: "morrelganj" }, { name: "রামপাল", slug: "rampal" },
        { name: "শরণখোলা", slug: "sarankhola" },
      ]},
      { name: "চুয়াডাঙ্গা", slug: "chuadanga", upazilas: [
        { name: "আলমডাঙ্গা", slug: "alamdanga" }, { name: "চুয়াডাঙ্গা সদর", slug: "chuadanga-sadar" },
        { name: "দামুড়হুদা", slug: "damurhuda" }, { name: "জীবননগর", slug: "jibannagar" },
      ]},
      { name: "যশোর", slug: "jashore", upazilas: [
        { name: "অভয়নগর", slug: "abhaynagar" }, { name: "বাঘারপাড়া", slug: "bagherpara" },
        { name: "চৌগাছা", slug: "chaugachha" }, { name: "ঝিকরগাছা", slug: "jhikargachha" },
        { name: "কেশবপুর", slug: "keshabpur" }, { name: "যশোর সদর", slug: "jashore-sadar" },
        { name: "মণিরামপুর", slug: "manirampur" }, { name: "শার্শা", slug: "sharsha" },
      ]},
      { name: "ঝিনাইদহ", slug: "jhenaidah", upazilas: [
        { name: "হরিণাকুণ্ডু", slug: "harinakunda" }, { name: "ঝিনাইদহ সদর", slug: "jhenaidah-sadar" },
        { name: "কালীগঞ্জ", slug: "kaliganj-jhenaidah" }, { name: "কোটচাঁদপুর", slug: "kotchandpur" },
        { name: "মহেশপুর", slug: "maheshpur" }, { name: "শৈলকুপা", slug: "shailkupa" },
      ]},
      { name: "খুলনা", slug: "khulna-district", upazilas: [
        { name: "বটিয়াঘাটা", slug: "batiaghata" }, { name: "দাকোপ", slug: "dacope" },
        { name: "ডুমুরিয়া", slug: "dumuria" }, { name: "দিঘলিয়া", slug: "dighalia" },
        { name: "কয়রা", slug: "koyra" }, { name: "খুলনা সদর", slug: "khulna-sadar" },
        { name: "পাইকগাছা", slug: "paikgachha" }, { name: "ফুলতলা", slug: "phultala" },
        { name: "রূপসা", slug: "rupsha" }, { name: "তেরখাদা", slug: "terkhada" },
      ]},
      { name: "কুষ্টিয়া", slug: "kushtia", upazilas: [
        { name: "ভেড়ামারা", slug: "bheramara" }, { name: "দৌলতপুর", slug: "daulatpur-kushtia" },
        { name: "খোকসা", slug: "khoksa" }, { name: "কুমারখালী", slug: "kumarkhali" },
        { name: "কুষ্টিয়া সদর", slug: "kushtia-sadar" }, { name: "মিরপুর", slug: "mirpur-kushtia" },
      ]},
      { name: "মাগুরা", slug: "magura", upazilas: [
        { name: "মাগুরা সদর", slug: "magura-sadar" }, { name: "মহম্মদপুর", slug: "mohammadpur" },
        { name: "শালিখা", slug: "shalikha" }, { name: "শ্রীপুর", slug: "sreepur-magura" },
      ]},
      { name: "মেহেরপুর", slug: "meherpur", upazilas: [
        { name: "গাংনী", slug: "gangni" }, { name: "মেহেরপুর সদর", slug: "meherpur-sadar" },
        { name: "মুজিবনগর", slug: "mujibnagar" },
      ]},
      { name: "নড়াইল", slug: "narail", upazilas: [
        { name: "কালিয়া", slug: "kalia" }, { name: "লোহাগড়া", slug: "lohagara-narail" },
        { name: "নড়াইল সদর", slug: "narail-sadar" },
      ]},
      { name: "সাতক্ষীরা", slug: "satkhira", upazilas: [
        { name: "আশাশুনি", slug: "assasuni" }, { name: "দেবহাটা", slug: "debhata" },
        { name: "কলারোয়া", slug: "kalaroa" }, { name: "কালীগঞ্জ", slug: "kaliganj-satkhira" },
        { name: "সাতক্ষীরা সদর", slug: "satkhira-sadar" }, { name: "শ্যামনগর", slug: "shyamnagar" },
        { name: "তালা", slug: "tala" },
      ]},
    ],
  },
  {
    name: "বরিশাল", slug: "barisal",
    districts: [
      { name: "বরগুনা", slug: "barguna", upazilas: [
        { name: "আমতলী", slug: "amtali" }, { name: "বামনা", slug: "bamna" },
        { name: "বরগুনা সদর", slug: "barguna-sadar" }, { name: "বেতাগী", slug: "betagi" },
        { name: "পাথরঘাটা", slug: "patharghata" }, { name: "তালতলী", slug: "taltali" },
      ]},
      { name: "বরিশাল", slug: "barisal-district", upazilas: [
        { name: "আগৈলঝারা", slug: "agailjhara" }, { name: "বাকেরগঞ্জ", slug: "bakerganj" },
        { name: "বানারীপাড়া", slug: "banaripara" }, { name: "বাবুগঞ্জ", slug: "babuganj" },
        { name: "বরিশাল সদর", slug: "barisal-sadar" }, { name: "গৌরনদী", slug: "gournadi" },
        { name: "হিজলা", slug: "hizla" }, { name: "মেহেন্দিগঞ্জ", slug: "mehendiganj" },
        { name: "মুলাদী", slug: "muladi" }, { name: "উজিরপুর", slug: "uzirpur" },
      ]},
      { name: "ভোলা", slug: "bhola", upazilas: [
        { name: "বোরহানউদ্দিন", slug: "borhanuddin" }, { name: "চরফ্যাশন", slug: "charfasson" },
        { name: "দৌলতখান", slug: "daulatkhan" }, { name: "ভোলা সদর", slug: "bhola-sadar" },
        { name: "লালমোহন", slug: "lalmohan" }, { name: "মনপুরা", slug: "manpura" },
        { name: "তজুমুদ্দিন", slug: "tajumuddin" },
      ]},
      { name: "ঝালকাঠি", slug: "jhalokati", upazilas: [
        { name: "ঝালকাঠি সদর", slug: "jhalokati-sadar" }, { name: "কাঁঠালিয়া", slug: "kathalia" },
        { name: "নলছিটি", slug: "nalchity" }, { name: "রাজাপুর", slug: "rajapur" },
      ]},
      { name: "পটুয়াখালী", slug: "patuakhali", upazilas: [
        { name: "বাউফল", slug: "bauphal" }, { name: "দশমিনা", slug: "dashmina" },
        { name: "দুমকি", slug: "dumki" }, { name: "গলাচিপা", slug: "galachipa" },
        { name: "কলাপাড়া", slug: "kalapara" }, { name: "মির্জাগঞ্জ", slug: "mirzaganj" },
        { name: "পটুয়াখালী সদর", slug: "patuakhali-sadar" }, { name: "রাঙ্গাবালী", slug: "rangabali" },
      ]},
      { name: "পিরোজপুর", slug: "pirojpur", upazilas: [
        { name: "ভান্ডারিয়া", slug: "bhandaria" }, { name: "কাউখালী", slug: "kawkhali" },
        { name: "মঠবাড়িয়া", slug: "mathbaria" }, { name: "নাজিরপুর", slug: "nazirpur" },
        { name: "নেছারাবাদ", slug: "nesarabad" }, { name: "পিরোজপুর সদর", slug: "pirojpur-sadar" },
        { name: "জিয়ানগর", slug: "zianagar" },
      ]},
    ],
  },
  {
    name: "সিলেট", slug: "sylhet",
    districts: [
      { name: "হবিগঞ্জ", slug: "habiganj", upazilas: [
        { name: "আজমিরীগঞ্জ", slug: "ajmiriganj" }, { name: "বাহুবল", slug: "bahubal" },
        { name: "বানিয়াচং", slug: "baniachong" }, { name: "চুনারুঘাট", slug: "chunarughat" },
        { name: "হবিগঞ্জ সদর", slug: "habiganj-sadar" }, { name: "লাখাই", slug: "lakhai" },
        { name: "মাধবপুর", slug: "madhavpur" }, { name: "নবীগঞ্জ", slug: "nabiganj" },
      ]},
      { name: "মৌলভীবাজার", slug: "moulvibazar", upazilas: [
        { name: "বড়লেখা", slug: "barlekha" }, { name: "জুড়ী", slug: "juri" },
        { name: "কমলগঞ্জ", slug: "kamalganj" }, { name: "কুলাউড়া", slug: "kulaura" },
        { name: "মৌলভীবাজার সদর", slug: "moulvibazar-sadar" }, { name: "রাজনগর", slug: "rajnagar" },
        { name: "শ্রীমঙ্গল", slug: "sreemangal" },
      ]},
      { name: "সুনামগঞ্জ", slug: "sunamganj", upazilas: [
        { name: "বিশ্বম্ভরপুর", slug: "bishwambarpur" }, { name: "ছাতক", slug: "chhatak" },
        { name: "দক্ষিণ সুনামগঞ্জ", slug: "dakshin-sunamganj" }, { name: "দিরাই", slug: "dirai" },
        { name: "ধর্মপাশা", slug: "dharmapasha" }, { name: "জগন্নাথপুর", slug: "jagannathpur" },
        { name: "জামালগঞ্জ", slug: "jamalganj" }, { name: "সুনামগঞ্জ সদর", slug: "sunamganj-sadar" },
        { name: "তাহিরপুর", slug: "tahirpur" }, { name: "শাল্লা", slug: "sulla" },
        { name: "মধ্যনগর", slug: "madhyanagar" },
      ]},
      { name: "সিলেট", slug: "sylhet-district", upazilas: [
        { name: "বালাগঞ্জ", slug: "balaganj" }, { name: "বিয়ানীবাজার", slug: "beanibazar" },
        { name: "বিশ্বনাথ", slug: "bishwanath" }, { name: "কোম্পানীগঞ্জ", slug: "companiganj-sylhet" },
        { name: "ফেঞ্চুগঞ্জ", slug: "fenchuganj" }, { name: "গোলাপগঞ্জ", slug: "golapganj" },
        { name: "গোয়াইনঘাট", slug: "gowainghat" }, { name: "জকিগঞ্জ", slug: "jakiganj" },
        { name: "কানাইঘাট", slug: "kanaighat" }, { name: "ওসমানীনগর", slug: "osmaninagar" },
        { name: "সিলেট সদর", slug: "sylhet-sadar" }, { name: "দক্ষিণ সুরমা", slug: "dakshin-surma" },
        { name: "জৈন্তাপুর", slug: "jointapur" },
      ]},
    ],
  },
  {
    name: "রংপুর", slug: "rangpur",
    districts: [
      { name: "দিনাজপুর", slug: "dinajpur", upazilas: [
        { name: "বীরগঞ্জ", slug: "birganj" }, { name: "বিরামপুর", slug: "birampur" },
        { name: "বিরল", slug: "biral" }, { name: "বোচাগঞ্জ", slug: "bochaganj" },
        { name: "চিরিরবন্দর", slug: "chirirbandar" }, { name: "ফুলবাড়ী", slug: "fulbari-dinajpur" },
        { name: "ঘোড়াঘাট", slug: "ghoraghat" }, { name: "হাকিমপুর", slug: "hakimpur" },
        { name: "কাহারোল", slug: "kaharole" }, { name: "খানসামা", slug: "khansama" },
        { name: "দিনাজপুর সদর", slug: "dinajpur-sadar" }, { name: "নবাবগঞ্জ", slug: "nawabganj-dinajpur" },
        { name: "পার্বতীপুর", slug: "parbatipur" },
      ]},
      { name: "গাইবান্ধা", slug: "gaibandha", upazilas: [
        { name: "ফুলছড়ি", slug: "fulchhari" }, { name: "গাইবান্ধা সদর", slug: "gaibandha-sadar" },
        { name: "গোবিন্দগঞ্জ", slug: "gobindaganj" }, { name: "পলাশবাড়ী", slug: "palashbari" },
        { name: "সাদুল্লাপুর", slug: "sadullapur" }, { name: "সাঘাটা", slug: "saghata" },
        { name: "সুন্দরগঞ্জ", slug: "sundarganj" },
      ]},
      { name: "কুড়িগ্রাম", slug: "kurigram", upazilas: [
        { name: "ভুরুঙ্গামারী", slug: "bhurungamari" }, { name: "চিলমারী", slug: "chilmari" },
        { name: "ফুলবাড়ী", slug: "fulbari-kurigram" }, { name: "কুড়িগ্রাম সদর", slug: "kurigram-sadar" },
        { name: "নাগেশ্বরী", slug: "nageshwari" }, { name: "রাজারহাট", slug: "rajarhat" },
        { name: "রাজিবপুর", slug: "rajibpur" }, { name: "রৌমারী", slug: "rowmari" },
        { name: "উলিপুর", slug: "ulipur" },
      ]},
      { name: "লালমনিরহাট", slug: "lalmonirhat", upazilas: [
        { name: "আদিতমারী", slug: "aditmari" }, { name: "হাতীবান্ধা", slug: "hatibandha" },
        { name: "কালীগঞ্জ", slug: "kaliganj-lalmonirhat" }, { name: "লালমনিরহাট সদর", slug: "lalmonirhat-sadar" },
        { name: "পাটগ্রাম", slug: "patgram" },
      ]},
      { name: "নীলফামারী", slug: "nilphamari", upazilas: [
        { name: "ডিমলা", slug: "dimla" }, { name: "ডোমার", slug: "domar" },
        { name: "জলঢাকা", slug: "jaldhaka" }, { name: "কিশোরগঞ্জ", slug: "kishoreganj-nilphamari" },
        { name: "নীলফামারী সদর", slug: "nilphamari-sadar" }, { name: "সৈয়দপুর", slug: "saidpur" },
      ]},
      { name: "পঞ্চগড়", slug: "panchagarh", upazilas: [
        { name: "আটোয়ারী", slug: "atwari" }, { name: "বোদা", slug: "boda" },
        { name: "দেবীগঞ্জ", slug: "debiganj" }, { name: "পঞ্চগড় সদর", slug: "panchagarh-sadar" },
        { name: "তেঁতুলিয়া", slug: "tetulia" },
      ]},
      { name: "রংপুর", slug: "rangpur-district", upazilas: [
        { name: "বদরগঞ্জ", slug: "badarganj" }, { name: "গঙ্গাচড়া", slug: "gangachara" },
        { name: "কাউনিয়া", slug: "kaunia" }, { name: "মিঠাপুকুর", slug: "mithapukur" },
        { name: "পীরগাছা", slug: "pirgachha" }, { name: "পীরগঞ্জ", slug: "pirganj-rangpur" },
        { name: "রংপুর সদর", slug: "rangpur-sadar" }, { name: "তারাগঞ্জ", slug: "taraganj" },
      ]},
      { name: "ঠাকুরগাঁও", slug: "thakurgaon", upazilas: [
        { name: "বালিয়াডাঙ্গী", slug: "baliadangi" }, { name: "হরিপুর", slug: "haripur" },
        { name: "পীরগঞ্জ", slug: "pirganj-thakurgaon" }, { name: "রানীশংকৈল", slug: "ranisankail" },
        { name: "ঠাকুরগাঁও সদর", slug: "thakurgaon-sadar" },
      ]},
    ],
  },
  {
    name: "ময়মনসিংহ", slug: "mymensingh",
    districts: [
      { name: "জামালপুর", slug: "jamalpur", upazilas: [
        { name: "বকশীগঞ্জ", slug: "bakshiganj" }, { name: "দেওয়ানগঞ্জ", slug: "dewanganj" },
        { name: "ইসলামপুর", slug: "islampur" }, { name: "জামালপুর সদর", slug: "jamalpur-sadar" },
        { name: "মাদারগঞ্জ", slug: "madarganj" }, { name: "মেলান্দহ", slug: "melandaha" },
        { name: "সরিষাবাড়ী", slug: "sarishabari" },
      ]},
      { name: "ময়মনসিংহ", slug: "mymensingh-district", upazilas: [
        { name: "ভালুকা", slug: "bhaluka" }, { name: "ধোবাউড়া", slug: "dhobaura" },
        { name: "ফুলপুর", slug: "fulpur" }, { name: "গফরগাঁও", slug: "gaffargaon" },
        { name: "গৌরীপুর", slug: "gauripur" }, { name: "হালুয়াঘাট", slug: "haluaghat" },
        { name: "ঈশ্বরগঞ্জ", slug: "ishwarganj" }, { name: "ময়মনসিংহ সদর", slug: "mymensingh-sadar" },
        { name: "মুক্তাগাছা", slug: "muktagachha" }, { name: "নান্দাইল", slug: "nandail" },
        { name: "ফুলবাড়িয়া", slug: "phulbaria" }, { name: "ত্রিশাল", slug: "trishal" },
        { name: "তারাকান্দা", slug: "tarakanda" },
      ]},
      { name: "নেত্রকোণা", slug: "netrokona", upazilas: [
        { name: "আটপাড়া", slug: "atpara" }, { name: "বারহাট্টা", slug: "barhatta" },
        { name: "দুর্গাপুর", slug: "durgapur-netrokona" }, { name: "কলমাকান্দা", slug: "kalmakanda" },
        { name: "কেন্দুয়া", slug: "kendua" }, { name: "খালিয়াজুরী", slug: "khaliajuri" },
        { name: "মদন", slug: "madan" }, { name: "মোহনগঞ্জ", slug: "mohanganj" },
        { name: "নেত্রকোণা সদর", slug: "netrokona-sadar" }, { name: "পূর্বধলা", slug: "purbadhala" },
      ]},
      { name: "শেরপুর", slug: "sherpur", upazilas: [
        { name: "ঝিনাইগাতী", slug: "jhenaigati" }, { name: "নকলা", slug: "nakla" },
        { name: "নালিতাবাড়ী", slug: "nalitabari" }, { name: "শেরপুর সদর", slug: "sherpur-sadar" },
        { name: "শ্রীবরদী", slug: "sreebardi" },
      ]},
    ],
  },
];

async function main() {
  console.log("Seeding geo data (divisions → districts → upazilas)...\n");

  let divCount = 0, distCount = 0, upaCount = 0;

  for (const div of GEO) {
    const division = await prisma.division.upsert({
      where: { slug: div.slug },
      update: {},
      create: { name: div.name, slug: div.slug },
    });
    divCount++;
    console.log(`✓ Division: ${div.name}`);

    for (const dist of div.districts) {
      const district = await prisma.district.upsert({
        where: { slug: dist.slug },
        update: { divisionId: division.id },
        create: { name: dist.name, slug: dist.slug, divisionId: division.id },
      });
      distCount++;

      for (const upa of dist.upazilas) {
        await prisma.upazila.upsert({
          where: { districtId_slug: { districtId: district.id, slug: upa.slug } },
          update: {},
          create: { name: upa.name, slug: upa.slug, districtId: district.id },
        });
        upaCount++;
      }
      console.log(`  ✓ District: ${dist.name} (${dist.upazilas.length} upazilas)`);
    }
    console.log("");
  }

  console.log(`\nDone!`);
  console.log(`  ${divCount} divisions`);
  console.log(`  ${distCount} districts`);
  console.log(`  ${upaCount} upazilas`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
