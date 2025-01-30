// src/pages/portal/components/preferences/constants.ts
import { PartsSourceCategory, PeripheralItem } from './types';

export const partsSourceCategories: PartsSourceCategory[] = [
    {
        name: 'חנויות מקומיות',
        sources: [
            { id: 'ksp', name: 'KSP', url: 'https://ksp.co.il' },
            { id: 'ivory', name: 'Ivory', url: 'https://ivory.co.il' },
            { id: 'bug', name: 'Bug', url: 'https://bug.co.il' },
            { id: 'tms', name: 'TMS', url: 'https://tms.co.il' }
        ]
    },
    {
        name: 'חנויות בינלאומיות',
        sources: [
            { id: 'amazon', name: 'Amazon', url: 'https://amazon.com' },
            { id: 'aliexpress', name: 'AliExpress', url: 'https://aliexpress.com' },
            { id: 'newegg', name: 'Newegg', url: 'https://newegg.com' },
            { id: 'ebay', name: 'eBay', url: 'https://ebay.com' }
        ]
    },
    {
        name: 'שוק יד שנייה',
        sources: [
            { id: 'facebook', name: 'Facebook Marketplace', url: 'https://facebook.com/marketplace' },
            { id: 'yad2', name: 'יד 2', url: 'https://market.yad2.co.il/collections/%D7%90%D7%9C%D7%A7%D7%98%D7%A8%D7%95%D7%A0%D7%99%D7%A7%D7%94_%D7%9C%D7%A4%D7%98%D7%95%D7%A4%D7%99%D7%9D-%D7%95%D7%9E%D7%97%D7%A9%D7%91%D7%99%D7%9D_%D7%A8%D7%9B%D7%99%D7%91%D7%99-%D7%9E%D7%97%D7%A9%D7%91' }
        ]
    }
];

export const defaultPeripherals: PeripheralItem[] = [
    { id: 'keyboard', name: 'מקלדת' },
    { id: 'mouse', name: 'עכבר' },
    { id: 'monitor', name: 'מסך' },
    { id: 'headphones', name: 'אוזניות' },
    { id: 'speakers', name: 'רמקולים' }
];