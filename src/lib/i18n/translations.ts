export type Language = 'mk' | 'en';

export const translations = {
  mk: {
    // Top banner
    top_location: 'ПРИЛЕП · ОД 2003',
    top_notice: 'БЕЗ ОНЛАЈН ПЛАЌАЊЕ · ПОДИГАЊЕ И ПЛАЌАЊЕ ВО ПРОДАВНИЦА',
    top_hours: 'ПОН/ТОР/ЧЕТ/ПЕТ 09:00–20:00 · СРЕ/САБ 09:00–16:00',

    // Nav & Mobile Bottom Nav
    nav_home: 'Дома',
    nav_collection: 'Колекција',
    nav_about: 'За нас',
    nav_location: 'Локација',
    nav_admin: 'Марија Админ',
    nav_lang: 'Јазик',

    // Hero
    hero_eyebrow: "MEN'S CASUAL WEAR · PRILEP",
    hero_title_1: 'RETRO',
    hero_title_2: 'BOUTIQUE',
    hero_desc: 'Casual машка мода, одличен избор и искрен личен пристап во Prilep од 2003 година. Резервирај го твоето парче онлајн, подигни и плати во продавницата.',
    hero_cta_shop: 'Погледни ја колекцијата',
    hero_cta_visit: 'Stiv Naumov 8, Prilep',

    // Editorial intro
    editorial_eyebrow: 'НОВА СЕЛЕКЦИЈА',
    editorial_title: 'Облечи се едноставно.',
    editorial_subtitle: 'Изгледај средено.',
    editorial_desc: 'Retro Boutique е локална машка продавница во Prilep. Секое парче е внимателно избрано за да ти понуди врвна удобност, совршен крој и автентичен секојдневен изглед.',

    // Campaign looks
    look_01_title: 'Everyday Denim & Layers',
    look_01_desc: 'Квалитетен тексас и лесни плетени џемпери за секој ден.',
    look_02_title: 'Statement Кошули',
    look_02_desc: 'Крој што одговара и за лежерен и за структуриран стил.',

    // Featured section
    featured_eyebrow: 'ПОНУДА ВО ПРОДАВНИЦАТА',
    featured_title: 'Актуелни модели',
    featured_all: 'Сите производи',
    featured_open_catalog: 'Отвори го целиот каталог',

    // Categories
    cat_all: 'Сите',
    cat_jeans: 'Фармерки',
    cat_sweaters: 'Џемпери',
    cat_shirts: 'Кошули',
    cat_trousers: 'Панталони',
    cat_other: 'Останато',

    // Catalog controls
    search_placeholder: 'Пребарај производ...',
    only_in_stock: 'Само на залиха',
    sort_newest: 'Најново',
    sort_price_asc: 'Цена: Ниска → Висока',
    sort_price_desc: 'Цена: Висока → Ниска',
    no_products_found: 'Нема пронајдени модели',
    no_products_desc: 'Не најдовме производи што одговараат на избраните филтри или пребарување.',
    reset_filters: 'Ресетирај филтри',

    // Product Card
    sold_out: 'Распродадено',
    only_x_left: 'Само {count} на залиха',
    sizes_label: 'Големини:',
    btn_details: 'Детали',
    btn_reserve: 'Резервирај',
    no_stock: 'Нема залиха',

    // Product Detail
    back_to_catalog: 'Назад кон колекцијата',
    choose_size: 'Избери големина:',
    stock_label: 'Залиха:',
    pieces: 'парчиња',
    pieces_short: 'пар.',
    btn_reserve_store: 'Резервирај за подигање во продавница',
    btn_no_stock_detail: 'Нема достапна залиха',
    notice_48h: '* Резервацијата те чека во продавницата 48 часа. Плаќање при подигнување.',
    model_description: 'Опис на моделот:',
    guarantee_location: 'Подигнување: Stiv Naumov 8, Prilep',
    guarantee_hours: 'Пон/Тор/Чет/Пет 09:00–20:00 · Сре/Саб 09:00–16:00',
    guarantee_fitting: 'Можност за проба и замена на големина на лице место',

    // How it works
    how_eyebrow: 'КАКО ФУНКЦИОНИРА',
    how_title: 'Онлајн избор. Локално подигање.',
    how_desc: 'Едноставен процес без кредитни картички и без комплицирани процедури.',
    step_01_num: '01',
    step_01_title: 'Избери парче & големина',
    step_01_desc: 'Прегледај ја понудата и избери ја големината што ти треба. Залихата се ажурира во реално време.',
    step_02_num: '02',
    step_02_title: 'Резервирај со телефон',
    step_02_desc: 'Внеси само име и телефонски број. Парчето се резервира веднаш и те чека во продавницата 48 часа.',
    step_03_num: '03',
    step_03_title: 'Подигни & плати во Retro',
    step_03_desc: 'Посети нè на Stiv Naumov 8 во Prilep, пробај го парчето и плати на каса.',

    // Story
    story_eyebrow: 'ОД 2003 ГОДИНА',
    story_title_1: 'Не само продавница.',
    story_title_2: 'Твој локален избор.',
    story_desc_1: 'Повеќе од две децении Retro Boutique им нуди на мажите во Prilep квалитетна, практична и модерна секојдневна гардероба.',
    story_desc_2: 'Нашата најголема вредност е искрената помош: ако не си сигурен за големина, должина или со што најдобро да го искомбинираш избраниот џемпер или кошула, ние сме тука лично да ти помогнеме.',
    story_badge_1: '20+ години традиција',
    story_badge_2: 'Проверени кроеви и материјали',

    // Visit Section
    visit_eyebrow: 'ПОСЕТИ НÈ ВО ПРОДАВНИЦАТА',
    visit_desc: 'Нашата продавница се наоѓа во срцето на Prilep. Посети нè за да ги пробаш новите модели и да добиеш искрен совет за големина и комбинација.',
    visit_address_label: 'Адреса',
    visit_hours_label: 'Работно време',
    visit_mon_tue_thu_fri: 'Пон, Тор, Чет, Пет:',
    visit_mon_tue_thu_fri_time: '09:00 – 20:00',
    visit_wed_sat: 'Среда, Сабота:',
    visit_wed_sat_time: '09:00 – 16:00',
    visit_sun: 'Недела:',
    visit_closed: 'Затворено',
    visit_maps_btn: 'Отвори на Google Maps',

    // Footer
    footer_about: 'Локална машка продавница за облека во Prilep. Квалитетни фармерки, кошули, џемпери и секојдневна машка мода со искрена и лична услуга.',
    footer_click_collect_desc: 'Избери големина и резервирај онлајн за 10 секунди. Резервацијата те чека во продавницата 48 часа. Без онлајн плаќање.',
    footer_instagram_btn: 'Следи нè на Instagram',
    footer_rights: 'Сите права се задржани.',

    // Reserve Modal
    modal_title: 'Резервирај за подигање',
    modal_size_label: 'Избери големина',
    modal_qty_label: 'Количина',
    modal_item_singular: 'парче',
    modal_item_plural: 'парчиња',
    modal_name_label: 'Име и презиме',
    modal_name_placeholder: 'Пр. Марко Петров',
    modal_phone_label: 'Телефонски број',
    modal_phone_placeholder: '07x xxx xxx',
    modal_email_label: 'Е-пошта',
    modal_email_optional: '(опционално)',
    modal_notice: '* Ова е резервација, а не онлајн купување. Плаќањето се врши во продавницата при подигнување на производот. Резервацијата важи 48 часа.',
    modal_total: 'Вкупно:',
    modal_cancel: 'Откажи',
    modal_confirm: 'Потврди резервација',
    modal_processing: 'Се обработува...',
    err_select_size: 'Ве молиме изберете големина.',
    err_enter_name: 'Ве молиме внесете име и презиме.',
    err_enter_phone: 'Ве молиме внесете телефонски број за контакт.',

    // Confirmation Page
    conf_eyebrow: 'УСПЕШНА РЕЗЕРВАЦИЈА',
    conf_title: 'Ви благодариме!',
    conf_number_label: 'Број на вашата резервација:',
    conf_number_note: 'Зачувајте го овој број или наведете го при подигнување на производите во продавницата.',
    conf_pickup_info: 'Информации за подигање:',
    conf_location_label: 'Локација',
    conf_hours_label: 'Работно време',
    conf_hours_val: 'Пон/Тор/Чет/Пет 09–20ч · Сре/Саб 09–16ч',
    conf_notice_title: 'Важна напомена:',
    conf_notice_desc: 'Резервацијата важи 48 часа. Плаќањето се врши исклучиво во продавницата при подигнување. Доколку имате прашање, контактирајте нè на Instagram.',
    conf_maps_btn: 'Отвори Google Maps',
    conf_back_btn: 'Кон колекцијата',
  },
  en: {
    // Top banner
    top_location: 'PRILEP · SINCE 2003',
    top_notice: 'NO ONLINE PAYMENT · PICKUP & PAY IN STORE',
    top_hours: 'MON/TUE/THU/FRI 09:00–20:00 · WED/SAT 09:00–16:00',

    // Nav & Mobile Bottom Nav
    nav_home: 'Home',
    nav_collection: 'Collection',
    nav_about: 'About',
    nav_location: 'Location',
    nav_admin: 'Maria Admin',
    nav_lang: 'Language',

    // Hero
    hero_eyebrow: "MEN'S CASUAL WEAR · PRILEP",
    hero_title_1: 'RETRO',
    hero_title_2: 'BOUTIQUE',
    hero_desc: 'Casual menswear, great selection, and honest personal service in Prilep since 2003. Reserve your piece online, pick up and pay in store.',
    hero_cta_shop: 'Shop the collection',
    hero_cta_visit: 'Stiv Naumov 8, Prilep',

    // Editorial intro
    editorial_eyebrow: 'NEW EDIT',
    editorial_title: 'Keep it simple.',
    editorial_subtitle: 'Look put together.',
    editorial_desc: 'Retro Boutique is a local menswear store in Prilep. Every piece is carefully selected to offer top comfort, great fit, and an authentic everyday style.',

    // Campaign looks
    look_01_title: 'Everyday Denim & Layers',
    look_01_desc: 'Premium denim and versatile knits made for daily wear.',
    look_02_title: 'Statement Shirts',
    look_02_desc: 'Tailored fit suited for casual and refined looks.',

    // Featured section
    featured_eyebrow: 'STORE EDIT',
    featured_title: 'Current Arrivals',
    featured_all: 'All products',
    featured_open_catalog: 'Open full catalogue',

    // Categories
    cat_all: 'All',
    cat_jeans: 'Jeans',
    cat_sweaters: 'Sweaters',
    cat_shirts: 'Shirts',
    cat_trousers: 'Trousers',
    cat_other: 'Other',

    // Catalog controls
    search_placeholder: 'Search products...',
    only_in_stock: 'In stock only',
    sort_newest: 'Newest',
    sort_price_asc: 'Price: Low → High',
    sort_price_desc: 'Price: High → Low',
    no_products_found: 'No products found',
    no_products_desc: 'No pieces matched your selected filters or search query.',
    reset_filters: 'Reset filters',

    // Product Card
    sold_out: 'Sold Out',
    only_x_left: 'Only {count} left in stock',
    sizes_label: 'Sizes:',
    btn_details: 'Details',
    btn_reserve: 'Reserve',
    no_stock: 'Out of stock',

    // Product Detail
    back_to_catalog: 'Back to collection',
    choose_size: 'Choose size:',
    stock_label: 'Stock:',
    pieces: 'pieces',
    pieces_short: 'pcs',
    btn_reserve_store: 'Reserve for store pickup',
    btn_no_stock_detail: 'Currently out of stock',
    notice_48h: '* Reservation holds for 48 hours. Payment happens when picking up in store.',
    model_description: 'Product Description:',
    guarantee_location: 'Store pickup: Stiv Naumov 8, Prilep',
    guarantee_hours: 'Mon/Tue/Thu/Fri 09:00–20:00 · Wed/Sat 09:00–16:00',
    guarantee_fitting: 'Fitting and size exchange available in store',

    // How it works
    how_eyebrow: 'HOW IT WORKS',
    how_title: 'Choose Online. Pick Up Locally.',
    how_desc: 'A seamless process without credit cards or complicated checkouts.',
    step_01_num: '01',
    step_01_title: 'Choose piece & size',
    step_01_desc: 'Browse our collection and choose the exact size you need with real-time stock updates.',
    step_02_num: '02',
    step_02_title: 'Reserve with your phone',
    step_02_desc: 'Just enter your name and phone number. Your item is held for pickup for 48 hours.',
    step_03_num: '03',
    step_03_title: 'Pick up & pay at Retro',
    step_03_desc: 'Visit us at Stiv Naumov 8 in Prilep, try on your items, and pay at the counter.',

    // Story
    story_eyebrow: 'SINCE 2003',
    story_title_1: 'More than a store.',
    story_title_2: 'Your local go-to.',
    story_desc_1: 'For more than two decades, Retro Boutique has provided men in Prilep with high-quality, practical, and stylish everyday clothing.',
    story_desc_2: 'Our biggest pride is genuine service: if you are unsure about sizes, fit, or outfit pairings, we are here to help you personally.',
    story_badge_1: '20+ years of heritage',
    story_badge_2: 'Curated fabrics & modern fits',

    // Visit Section
    visit_eyebrow: 'VISIT US IN STORE',
    visit_desc: 'Our boutique is located in the heart of Prilep. Drop by to explore new arrivals and get honest styling and sizing advice.',
    visit_address_label: 'Address',
    visit_hours_label: 'Opening Hours',
    visit_mon_tue_thu_fri: 'Mon, Tue, Thu, Fri:',
    visit_mon_tue_thu_fri_time: '09:00 – 20:00',
    visit_wed_sat: 'Wed, Sat:',
    visit_wed_sat_time: '09:00 – 16:00',
    visit_sun: 'Sunday:',
    visit_closed: 'Closed',
    visit_maps_btn: 'Open in Google Maps',

    // Footer
    footer_about: "Local menswear boutique in Prilep, North Macedonia. Quality jeans, shirts, sweaters, and everyday men's fashion with genuine personal care.",
    footer_click_collect_desc: 'Select your size and reserve online in 10 seconds. Reserved for 48 hours. No online payment needed.',
    footer_instagram_btn: 'Follow us on Instagram',
    footer_rights: 'All rights reserved.',

    // Reserve Modal
    modal_title: 'Reserve for Pickup',
    modal_size_label: 'Select Size',
    modal_qty_label: 'Quantity',
    modal_item_singular: 'piece',
    modal_item_plural: 'pieces',
    modal_name_label: 'Full Name',
    modal_name_placeholder: 'E.g. Marko Petrov',
    modal_phone_label: 'Phone Number',
    modal_phone_placeholder: '07x xxx xxx',
    modal_email_label: 'Email',
    modal_email_optional: '(optional)',
    modal_notice: '* This is a store reservation, not an online purchase. Payment is made at the physical store in Prilep (Stiv Naumov 8) upon pickup. Reservation is valid for 48 hours.',
    modal_total: 'Total:',
    modal_cancel: 'Cancel',
    modal_confirm: 'Confirm Reservation',
    modal_processing: 'Processing...',
    err_select_size: 'Please select a size.',
    err_enter_name: 'Please enter your full name.',
    err_enter_phone: 'Please enter your contact phone number.',

    // Confirmation Page
    conf_eyebrow: 'RESERVATION CONFIRMED',
    conf_title: 'Thank you!',
    conf_number_label: 'Your reservation number:',
    conf_number_note: 'Save this number or present it when collecting your items at the store.',
    conf_pickup_info: 'Pickup Information:',
    conf_location_label: 'Location',
    conf_hours_label: 'Opening Hours',
    conf_hours_val: 'Mon/Tue/Thu/Fri 09–20h · Wed/Sat 09–16h',
    conf_notice_title: 'Important note:',
    conf_notice_desc: 'Your reservation is held for 48 hours. Payment is made exclusively at the physical store when picking up. If you have any questions, reach out on Instagram.',
    conf_maps_btn: 'Open Google Maps',
    conf_back_btn: 'Back to Collection',
  },
};

export type TranslationKey = keyof typeof translations.mk;
