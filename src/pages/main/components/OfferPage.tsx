// src/pages/main/components/OfferPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Checkbox } from 'components/ui/checkbox';
import { Label } from 'components/ui/label';
import { RadioGroup, RadioGroupItem } from 'components/ui/radio-group';
import { Alert, AlertDescription } from 'components/ui/alert';
import emailjs from '@emailjs/browser';
import { supabase } from 'context/auth'

import { useLocationService } from 'hooks/useLocationService';
import type { 
  GeocodingResult, 
  City as CityData,
  StreetSuggestion 
} from 'hooks/useLocationService';
import { operatingSystems, computerUseTypes, gamingResolutions, videoEditingSoftware } from 'utils/constants';


// EmailJS Configuration
const EMAIL_SERVICE = 'service_qy3nij6';
const EMAIL_P_KEY = 'ulj1-31N6L81zpCEt';
const EMAIL_OFFER_TEMPLATE_ID = 'template_cnvxqgl';

const REACT_APP_DEPLOYMENT_URL = "https://maniv-pc.github.io"

interface ReferralValidation {
  isValid: boolean;
  message: string | null;
  discountApplied?: boolean;
}

interface ReferralValidation {
  isValid: boolean;
  message: string | null;
  discountApplied?: boolean;
  discountPercentage?: number;
 }

export const OfferPage = () => {
  // Form state
  const { getCoordinates, getCities, searchStreets, calculateLocationCost } = useLocationService();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [useTypes, setUseTypes] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState('consultationAndBuild');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [customOS, setCustomOS] = useState('');
  const [gameResolution, setGameResolution] = useState('');
  const [isCustomFps, setIsCustomFps] = useState(false);
  const [videoEditSoftware, setVideoEditSoftware] = useState('');
  const [customVideoSoftware, setCustomVideoSoftware] = useState('');
  const [buildLocation, setBuildLocation] = useState('business');
  const [pickupOrShipping, setPickupOrShipping] = useState('pickup');
  const [cities, setCities] = useState<CityData[]>([]);
  const [selectedCityData, setSelectedCityData] = useState<CityData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoordinates, setSelectedCoordinates] = useState<GeocodingResult | null>(null);
  const [streetSearchTerm, setStreetSearchTerm] = useState('');
  const [showCitySearch, setShowCitySearch] = useState(true);
  const [streetSuggestions, setStreetSuggestions] = useState<StreetSuggestion[]>([]);

  // New state for address fields
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralValidation, setReferralValidation] = useState<ReferralValidation>({
      isValid: false,
      message: null,
      discountApplied: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Show address fields when needed
  const shouldShowAddress = buildLocation === 'customer' || pickupOrShipping === 'shipping';
  
  const calculateServiceCost = (
    budget: number, 
    option: string, 
    buildLocation: string, 
    pickupOrShipping: string,
    discountPercentage?: number
  ) => {
    let serviceCost = 0;
    const baseServiceRate = budget * 0.1;
    
    switch (option) {
      case "consultationOnly": serviceCost = baseServiceRate * 0.2; break;
      case "buildOnly": serviceCost = baseServiceRate * 0.8; break;
      default: serviceCost = baseServiceRate;
    }
  
    if (selectedCoordinates && (buildLocation === 'customer' || pickupOrShipping === 'shipping')) {
      serviceCost += calculateLocationCost(
        selectedCoordinates,
        buildLocation === 'customer' ? 'build_at_home' : 'shipping'
      );
    }
  
    // Apply discount if provided
    if (discountPercentage) {
      serviceCost *= (100 - discountPercentage) / 100;
    }
    
    return Math.floor(serviceCost);
  };

  const getTotalCost = () => {
    if (!budget || parseFloat(budget) <= 0) return 0;
    
    return calculateServiceCost(
      parseFloat(budget),
      selectedOption,
      selectedOption === "consultationOnly" ? "business" : buildLocation,
      selectedOption === "consultationOnly" ? "pickup" : pickupOrShipping,
      referralValidation.isValid && referralValidation.discountApplied ? 
        referralValidation.discountPercentage : undefined
    );
  };

  // בדיקת הרשאות מורחבת
  const validateReferralCode = async (email: string) => {
    if (!referralCode || !email || !fullName) {
      setReferralValidation({
        isValid: false,
        message: 'נא למלא את כל השדות (שם מלא, אימייל וקוד הפניה)',
        discountApplied: false
      });
      return;
    }
   
    try {
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select('*')
        .eq('code', referralCode.toUpperCase())
        .eq('new_customer_email', email)
        .eq('new_customer_name', fullName.trim())
        .eq('used', false);
   
      if (referralError) {
        throw referralError;
      }
   
      if (referralData && referralData.length > 0) {
        const discountPercentage = referralData[0].discount_percentage;
        setReferralValidation({
          isValid: true,
          message: `קוד הפניה תקין! הנחה של ${discountPercentage}% תתווסף להזמנה`,
          discountApplied: true,
          discountPercentage: discountPercentage
        });
      } else {
        setReferralValidation({
          isValid: false,
          message: 'קוד הפניה לא תקין או לא תואם לפרטים שהוזנו',
          discountApplied: false
        });
      }
    } catch (err) {
      console.error('Validation error:', err);
      setReferralValidation({
        isValid: false,
        message: 'שגיאה באימות קוד ההפניה',
        discountApplied: false
      });
    }
   };
   
  const updateReferralStatus = async (code: string, email: string) => {
      console.log('Starting referral update:', { code, email });
      
      try {
          // First verify the referral exists and is valid
          const { data: verifyData, error: verifyError } = await supabase
              .from('referrals')
              .select('*')
              .eq('code', code.toUpperCase())
              .eq('new_customer_email', email)
              .eq('new_customer_name', fullName.trim())
              .eq('used', false)
              .single();
              
          if (verifyError || !verifyData) {
              console.error('Verification error:', verifyError);
              throw new Error('Failed to verify referral');
          }

          // Then update it
          const currentTime = new Date().toISOString();
          const { data, error } = await supabase
              .from('referrals')
              .update({ 
                  used: true,
                  used_at: currentTime
              })
              .eq('id', verifyData.id)  // Using ID for more precise update
              .select();

          if (error) {
              console.error('Update error:', error);
              throw error;
          }

          console.log('Referral updated successfully:', data);
          return data;
      } catch (err) {
          console.error('Error updating referral:', err);
          throw err;
      }
  };

  useEffect(() => {
    emailjs.init(EMAIL_P_KEY);
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      const citiesList = await getCities();
      setCities(citiesList);
    };
    loadCities();
  }, [getCities]);

  const filteredCities = useMemo(() => {
    return cities.filter(city => 
      city.name.startsWith(searchTerm) || 
      city.name.includes(searchTerm)
    );
  }, [cities, searchTerm]);

    // Update the handleSubmit function by adding referral processing
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
    
      try {
        // Validate inputs
        if (!/^0\d{1,2}-?\d{7}$/.test(phone)) {
          alert("מספר טלפון לא תקין");
          return;
        }
    
        if (!/^\S+@\S+\.\S+$/.test(email)) {
          alert("כתובת מייל לא תקינה");
          return;
        }
    
        if (parseFloat(budget) <= 0) {
          alert("יש להזין תקציב גבוה מ-0");
          return;
        }
    
        // Process form data and submit
        const deliveryType: 'pickup' | 'build_at_home' | 'shipping' = 
          buildLocation === 'customer' ? 'build_at_home' :
          pickupOrShipping === 'pickup' ? 'pickup' : 'shipping';

        const serviceCost = calculateServiceCost(
          parseFloat(budget),
          selectedOption,
          buildLocation,
          pickupOrShipping,
          referralValidation.isValid && referralValidation.discountApplied ? 
            referralValidation.discountPercentage : undefined
        );

        const getOperatingSystem = () => operatingSystem === 'other' ? customOS : operatingSystem;

        // Simplified offerData with only necessary financial fields
        const offerData = {
          full_name: fullName,
          email,
          phone,
          budget: parseFloat(budget),
          service_cost: serviceCost,
          service_type: selectedOption,
          operating_system: getOperatingSystem(),
          use_types: useTypes,
          game_resolution: useTypes.includes('גיימינג') ? gameResolution : null,
          video_software: useTypes.includes('עריכת וידאו') ? 
            (videoEditSoftware === 'other' ? customVideoSoftware : videoEditSoftware) : null,
          delivery_type: deliveryType,
          address: deliveryType !== 'pickup' ? `${street} ${streetNumber}` : null,
          city: deliveryType !== 'pickup' ? city : null,
          referral_code: referralValidation.isValid ? referralCode.toUpperCase() : null
        };

        const { data: supabaseData, error: offerError } = await supabase
        .from('offers')
        .insert(offerData)
        .select()
        .single();
  
        if (offerError) throw offerError;
    
        // Process referral if valid
        if (referralValidation.isValid && referralCode) {
          await updateReferralStatus(referralCode, email);
        }

        // Prepare email template parameters
        const templateParams = {
          to_name: fullName,
          from_name: "מניב לך מחשב",
          to_email: email,
          reply_to: email,
          offer_id: supabaseData.id.toString(),
          full_name: fullName,
          budget: budget.toString(),
          service_cost: Math.round(serviceCost).toString(),
          service_type: selectedOption === "consultationOnly" ? "ייעוץ בלבד" :
                      selectedOption === "buildOnly" ? "הרכבה בלבד" :
                      "ייעוץ והרכבה",
          operating_system: operatingSystem === 'other' ? customOS : operatingSystem,
          use_types: useTypes.length > 0 ? useTypes.join(', ') : 'לא צוין',
          video_software: useTypes.includes('עריכת וידאו') ? 
            (videoEditSoftware === 'other' ? customVideoSoftware : videoEditSoftware) : '',
          game_resolution: useTypes.includes('גיימינג') ? gameResolution : '',
          delivery_details: deliveryType === 'pickup' ? "איסוף עצמי" :
                          deliveryType === 'build_at_home' ? 
                          `הרכבה בכתובת: ${street || ''}, ${city || ''}` :
                          `משלוח לכתובת: ${street || ''}, ${city || ''}`,
          delivery_type: deliveryType || 'לא צוין',
          main_website: REACT_APP_DEPLOYMENT_URL,
          discount_applied: referralValidation.discountApplied ? '20%' : 'לא'
        };

        // Send email notification
          const emailResponse = await emailjs.send(
            EMAIL_SERVICE,
            EMAIL_OFFER_TEMPLATE_ID,
            templateParams,
            EMAIL_P_KEY
          );
        
          if (emailResponse.status === 200) {
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              window.location.reload();
            }, 10000);
          } else {
            throw new Error(`Email sending failed: ${emailResponse.status}`);
          }
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('אירעה שגיאה בשליחת הטופס');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showSuccess && (
        <Alert className="fixed top-4 right-4 w-96 bg-green-500 text-white z-50">
          <AlertDescription>
            הטופס נשלח בהצלחה! העמוד יתרענן אוטומטית תוך 10 שניות
          </AlertDescription>
        </Alert>
      )}
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white text-center">שליחת הצעה למפרט</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="mb-2 font-bold text-lg underline">פרטים מזהים</h3>
          <Input 
            placeholder="שם מלא" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="bg-white text-black"
          />

          <div className="flex space-x-reverse space-x-2">
            <Input 
              placeholder="אימייל" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white text-black"
            />
            <Input 
              placeholder="טלפון" 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white text-black"
            />
          </div>

          <h3 className="mb-2 font-bold text-lg underline">על בסיס מה נרכיב</h3>
          <Input 
            type="number" 
            placeholder="תקציב מחשב" 
            value={budget}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (value <= 0) {
                alert("התקציב חייב להיות גדול מ-0");
                setBudget('0');
                return;
              }
              setBudget(e.target.value);
            }}
            required
            min="1"
            className="bg-white text-black"
          />

        {/* OS selection Section */}

        <Select onValueChange={setOperatingSystem}>
            <SelectTrigger className="bg-white text-black">
            <SelectValue placeholder="מערכת הפעלה" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black mt-2 rounded shadow-lg transition-all duration-300">
            {operatingSystems.map((os: (typeof operatingSystems)[number]) => (
                <SelectItem key={os} value={os}>{os}</SelectItem>
            ))}
            <SelectItem value="other">אחר</SelectItem>
            </SelectContent>
        </Select>

        {operatingSystem === 'other' && (
            <Input 
            placeholder="פרט מערכת הפעלה" 
            value={customOS}
            onChange={(e) => setCustomOS(e.target.value)}
            className="bg-white text-black"
            />
        )}

        <div>
            <h3 className="mb-2 font-bold text-lg underline">שימוש במחשב</h3>
            <div className="grid grid-cols-2 gap-2">
            {computerUseTypes.map((item: (typeof computerUseTypes)[number]) => (
                <div key={item.value} className="flex items-center space-x-reverse space-x-2 p-2 rounded">
                  <Checkbox 
                    id={item.value}
                    onCheckedChange={(checked) => 
                      setUseTypes(prev => checked ? [...prev, item.value] : prev.filter(type => type !== item.value))
                    }
                  />
                  <Label htmlFor={item.value} className="cursor-pointer">
                    {item.value === 'שימוש רגיל' ? 'שימוש רגיל (גלישה באינטרנט, צפייה בסרטונים)' : item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {useTypes.includes('גיימינג') && (
            <div className="flex gap-2">
              <div className="flex-1">
                <Select onValueChange={(value) => setGameResolution(prev => {
                  const [, fps] = (prev || '').split(',');
                  return `${value}${fps ? `,${fps}` : ''}`;
                })}>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="רזולוצית משחק" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black mt-2 rounded shadow-lg transition-all duration-300">
                    {gamingResolutions.map((res: (typeof gamingResolutions)[number]) => (
                      <SelectItem key={res} value={res}>{res}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                {/* הסלקט של ה-FPS */}
                {!isCustomFps ? (
                  <Select onValueChange={(fps) => {
                    if (fps === 'custom') {
                      setIsCustomFps(true);
                    } else {
                      const [resolution] = (gameResolution || '').split(',');
                      setGameResolution(resolution ? `${resolution},${fps}` : '');
                    }
                  }}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="FPS רצוי" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black mt-2 rounded shadow-lg transition-all duration-300">
                      {[30, 60, 120, 180, 240].map(fps => (
                        <SelectItem key={fps} value={fps.toString()}>{fps} FPS</SelectItem>
                      ))}
                      <SelectItem value="custom">FPS אחר</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="number"
                    placeholder="הכנס FPS רצוי"
                    className="bg-white text-black"
                    min="20"
                    step="10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value;
                        if (/^[1-9]\d*0$/.test(value) && parseInt(value) > 10) {
                          const [resolution] = (gameResolution || '').split(',');
                          setGameResolution(resolution ? `${resolution},${value}` : '');
                          setIsCustomFps(false);
                        } else {
                          alert('ערך לא תקין. חייב להיות מספר שמסתיים ב-0 וגדול מ-10');
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {useTypes.includes('עריכת וידאו') && (
            <>
              <Select onValueChange={setVideoEditSoftware}>
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="תוכנת עריכה מועדפת" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black mt-2 rounded shadow-lg transition-all duration-300">
                  {videoEditingSoftware.map((software: (typeof videoEditingSoftware)[number]) => (
                    <SelectItem key={software} value={software}>
                      {software}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {videoEditSoftware === 'other' && (
                <Input 
                  placeholder="פרט את תוכנת העריכה" 
                  value={customVideoSoftware}
                  onChange={(e) => setCustomVideoSoftware(e.target.value)}
                  className="bg-white text-black mt-2"
                />
              )}
            </>
          )}

          <h3 className="mb-2 font-bold text-lg underline">שירות</h3>
          <RadioGroup onValueChange={(value) => setSelectedOption(value)} defaultValue="consultationAndBuild">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="consultationOnly" id="consultationOnly" />
                <Label htmlFor="consultationOnly">ייעוץ בלבד</Label>
              </div>
              <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="buildOnly" id="buildOnly" />
                <Label htmlFor="buildOnly">הרכבה בלבד</Label>
              </div>
              <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="consultationAndBuild" id="consultationAndBuild" />
                <Label htmlFor="consultationAndBuild">ייעוץ והרכבה (ברירת מחדל)</Label>
              </div>
            </div>
          </RadioGroup>

          {selectedOption !== "consultationOnly" && (
            <>
              <h3 className="mb-2 font-bold text-lg underline">מיקום הרכבה</h3>
              <RadioGroup 
                defaultValue="business" 
                value={buildLocation}
                onValueChange={setBuildLocation}
                className="mb-4"
              >
                <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business">הרכבה בבית העסק</Label>
                </div>
                <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="customer" id="customer" />
                  <Label htmlFor="customer">הרכבה בבית הלקוח (לפי מרחק)</Label>
                </div>
              </RadioGroup>

              {buildLocation === 'business' && (
                <RadioGroup 
                  defaultValue="pickup" 
                  value={pickupOrShipping}
                  onValueChange={setPickupOrShipping}
                  className="mb-4"
                >
                  <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup">איסוף מהעסק</Label>
                  </div>
                  <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="shipping" id="shipping" />
                    <Label htmlFor="shipping">משלוח לבית הלקוח (לפי מרחק)</Label>
                  </div>
                </RadioGroup>
              )}
            </>
          )}

          {shouldShowAddress && (
            <section className="space-y-4">
              <h3 className="mb-2 font-bold text-lg underline">כתובת למשלוח/הרכבה</h3>
              
              <section className="relative">
                <Input
                  type="text"
                  placeholder="חפש עיר..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowCitySearch(true);
                    if (!e.target.value) {
                      setCity('');
                      setSelectedCityData(null);
                      setSelectedCoordinates(null);
                    }
                  }}
                  className="bg-white text-black w-full"
                />
                {searchTerm.length > 0 && filteredCities.length > 0 && showCitySearch && (
                  <section className="absolute z-50 w-full bg-white rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredCities.map((cityData: CityData) => (
                      <article
                        key={cityData.name}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                        onClick={() => {
                          setCity(cityData.name);
                          setSearchTerm(cityData.name);
                          setSelectedCityData(cityData);
                          setShowCitySearch(false);
                          getCoordinates(cityData.name).then(coords => {
                            if (coords) setSelectedCoordinates(coords);
                          });
                        }}
                      >
                        {cityData.name}
                      </article>
                    ))}
                  </section>
                )}
              </section>

              {city && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input 
                        placeholder="חפש רחוב..."
                        value={streetSearchTerm}
                        onChange={async (e) => {
                          const term = e.target.value;
                          setStreetSearchTerm(term);
                          
                          if (term.length >= 2) {
                            const suggestions = await searchStreets(term, city);
                            setStreetSuggestions(suggestions);
                          } else {
                            setStreetSuggestions([]);
                          }
                        }}
                        className="bg-white text-black w-full"
                        required={shouldShowAddress}
                      />
                      
                      {streetSuggestions.length > 0 && (
                        <section className="absolute z-50 w-full bg-white rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                          {streetSuggestions.map((suggestion: StreetSuggestion, index: number) => (
                            <article
                              key={index}
                              className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                              onClick={async () => {
                                setStreet(suggestion.street);
                                setStreetSearchTerm(suggestion.street);
                                setStreetSuggestions([]);
                                const coords = await getCoordinates(
                                  `${suggestion.street} ${streetNumber}, ${city}`
                                );
                                if (coords) setSelectedCoordinates(coords);
                              }}
                            >
                              {suggestion.street}
                            </article>
                          ))}
                        </section>
                      )}
                    </div>
                    <div className="w-24">
                      <Input 
                        type="number"
                        placeholder="מספר"
                        value={streetNumber}
                        onChange={(e) => {
                          const num = parseInt(e.target.value);
                          if (num > 0 || e.target.value === '') {
                            setStreetNumber(e.target.value);
                            if (street) {
                              getCoordinates(`${street} ${e.target.value}, ${city}`).then(coords => {
                                if (coords) setSelectedCoordinates(coords);
                              });
                            }
                          }
                        }}
                        min="1"
                        className="bg-white text-black"
                        required={shouldShowAddress}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          <div className="space-y-2 mt-4">
            <div className="flex space-x-2 space-x-reverse">
              <Input
                type="text"
                placeholder="קוד הפניה (אופציונלי)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="bg-white text-black"
                dir="rtl"
              />
              <Button
                type="button"
                onClick={() => validateReferralCode(email)}
                disabled={!referralCode || !email}
                className="bg-blue-600 hover:bg-blue-700"
              >
                אמת קוד
              </Button>
            </div>
            {referralValidation.message && (
              <Alert variant={referralValidation.isValid ? "default" : "destructive"}>
                <AlertDescription>{referralValidation.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="font-bold mt-4 p-4 bg-blue-700 rounded">
              <div className="text-lg mb-2">פירוט עלויות:</div>
              <div className="space-y-1 text-sm">
                <div>תקציב בסיס: {parseFloat(budget) > 0 ? budget : '0'} ₪</div>
                {selectedOption !== "consultationOnly" && city && selectedCoordinates && (buildLocation === 'customer' || pickupOrShipping === 'shipping') && (
                  <div>
                    {buildLocation === 'customer' ? 'עלות הרכבה בבית הלקוח' : 'עלות משלוח'}: {
                      Math.floor(calculateLocationCost(selectedCoordinates, buildLocation === 'customer' ? 'build_at_home' : 'shipping'))
                    } ₪
                    <div className="text-xs text-gray-300">
                      ({city} - {selectedCoordinates.display_name})
                    </div>
                  </div>
                )}
                  <div>סוג שירות: {
                      selectedOption === "consultationOnly" ? "ייעוץ בלבד (20%)" :
                      selectedOption === "buildOnly" ? "הרכבה בלבד (80%)" :
                      "ייעוץ והרכבה (100%)"
                  }</div>
                  {/* Show original total and discount calculation only when referral is successfully validated */}
                  {referralValidation.isValid && referralValidation.discountApplied ? (
                      <>
                          <div className="mt-2 pt-2 border-t border-blue-600">
                              מחיר מקורי: {calculateServiceCost(
                                  parseFloat(budget), 
                                  selectedOption, 
                                  selectedOption === "consultationOnly" ? "business" : buildLocation, 
                                  selectedOption === "consultationOnly" ? "pickup" : pickupOrShipping
                              )} ₪
                          </div>
                          <div className="text-green-300">
                            הנחת קוד הפניה ({referralValidation.discountPercentage}%-): {Math.round(
                              calculateServiceCost(
                                parseFloat(budget),
                                selectedOption,
                                selectedOption === "consultationOnly" ? "business" : buildLocation,
                                selectedOption === "consultationOnly" ? "pickup" : pickupOrShipping
                              ) * (referralValidation.discountPercentage! / 100)
                            )} ₪
                          </div>
                      </>
                  ) : null}

                  {/* Final total amount */}
                  <div className="text-lg font-bold mt-2 pt-2 border-t border-blue-600">
                    סה"כ לתשלום: {getTotalCost()} ₪
                    {referralValidation.isValid && referralValidation.discountApplied && (
                      <span className="text-sm text-green-300 mr-2">(אחרי הנחת קוד הפניה)</span>
                    )}
                  </div>
              </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? "...שולח" : "שלח הצעה"}
          </Button>
        </form>
      </CardContent>
    </Card>
    </>
  );
};

export default OfferPage;