V0.45
- Itinerary: Hotel Card
  - Mobile friendly

- Itinerary: Restaurant Card
  - Mobile friendly

- Itinerary: Trip Header
  - Added day of the week

V0.44
- User input form: UI/UX
  - Mobile friendly

V0.43
- User input form: UX
  - Currency selector only shows on SummaryStep

V0.42
- User input form: UX
  - Optimized layout for vertical space savings

V0.41
- Itinerary: Activity Card
  - Faster and stable itinerary generation

V0.40
- User input form: UX
  - Updated tailwind color scheme
  - Resized and recolored navigation buttons
  - Removed autofocus from PreferenceStep
  - Swap order of PreferenceStep with BudgetStep

V0.39
- Itinerary: Restaurant Card
  - Added creteria for Rating Above 4.0 and 1,000+ reviews
  - Added number of reviews
  - Remove average price per meal

V0.38
- Itinerary: Hotel Card
  - Fixed affliate ID link in booking.com URL generation

V0.37
- Itinerary: Activity Card
  - View Map button aligned to right
  - Labels moved to above title and color added
  - Column layout ratio updated to 47.5% and 52.5%

- Itinerary: Restaurant Card
  - Added rating
  - Added average meal price

V0.36
- General: Build
  - Build error fixed

V0.35
- Itinerary: Gemini
  - Boken down gemini prompts into 3 separate prompts, flight, hotel and itinerary

- Itinerary: Activity Card
  - Added entrance price of activity in local currency

V0.34
- General: UX
  - Scales to 50% of screen width for desktop

V0.33
- Itinerary: Activity Card
  - Added auto retry mechanism to get images for activities from Google Places

- Itinerary: Activity Card
  - Added sticky day tab navigation
  - Added next day button
  - Autoscroll to top of the day when day changes

V0.32
- User input form: Origin City
  - Auto-detect nearest city with major airport and auto fills textbox

- User input form: City
  - Fixed auto advance when selecting city from autocomplete list

V0.31
- Itinerary: Activity Card - Restaurant
  - Added must try dishes with description

V0.30
- Itinerary: Activity Card
  - Added horizontal separator between activities
  - One column on mobile
  - Fixed Google Maps link error on mobile

V0.29
- Itinerary: UI
  - Fixed section spacing
    
- Itinerary: UX
  - Auto retry when itinerary fails to generate

- Itinerary: Activity Card
  - View location link which opens in Google Maps
  - Recommended duration for activity

V0.28
- Itinerary: Trip Header
  - Updated number of days text and slideshow size
    
- Itinerary: Activity Card
  - Removed icon from label

- Itinerary: UX
  - Autoscroll to flight
 
- Itinerary: Flight Card
  - UI updates

- Itinerary: Hotel Card
  - UI updates

V0.27
- Itinerary: Activity Card
  - Relevant image from Google Place
  - Short description for each activity
  - Added label for activity, lunch, dinner, nightlife 

- Itinerary: Gemini
  - If nightlife is selected, then adds additional activity for the day

V0.26
- User input form: UX
  - Standardized card layouts

V0.25
- Itinerary: Trip Header
  - Load exactly 10 images

- Itinerary: Flights
  - Real search of flight price estimate
  - Gets IATA code of cities for more accurate flight link generation

V0.24
- Itinerary: Trip Header
  - Added trip header with image slideshow

V0.23
- User input form: UX
  - Scaled content to max viewport height without scrolling

- User input form: UI
  - Implemented shadcn UI

V0.22    
- Itinerary: Hotel
  - Updated UI

- Itinerary: Flights
  - Updated UI

- User input form: Hotel Step
  - Update price ranges

V0.21    
- Itinerary: Hotel
  - Adjusted to show criteria, then button links to search with criteria

V0.20    
- Itinerary: Hotel
  - Searches hotel and displays on hotel recommendation card tile

V0.19
- User input form: Time Step
  - Removed Time Step and all related components
    
- Itinerary: Flights
  - Improved Skyscanner URL generation, never more than 1 stop

V0.18
- Itinerary:
  - Integrated Gemini AI API
    
- Itinerary: Flights
  - Integrated SkyScanner API
  - Searches flight and displays on flight card tile

V0.17
- User input form: Step Section
  - Wrapped inside accordion
  - Auto close accordion when user clicks on Create Itinerary button
 
- Itinerary:
  - Created seperate component
  - Auto scroll to Itinerary section when user clicks on Create Itinerary button

V0.16
- User input form: City Step
  - Added autocomplete functionality using Google Maps / Places API
 
- User input form: City Origin Step
  - Added autocomplete functionality using Google Maps / Places API

- User input form: Hotel Step
  - Added autocomplete functionality using Google Maps / Places API

V0.15
- User input form: Date Step
  - Renamed Arrival Date with Departure Date, Departure Date with Return Date
 
- User input form: Time Step
  - Renamed headings
  - Updated layout to 4 columns

- User input form: Hotel Step
  - Per night on seperate line

- User input form: Summary Step
  - Updated Travel Times labels
  - Updated layout to 2 columns
  - Fixed edit button going to the correct page

V0.14
- User input form: UX
  - Add auto-focus to input fields

- Page
  - Remove heading and sub-heading text

V0.13
- User input form: Currency Selector
  - Integrated ExchangeRate API
  - Added Currency Selector to multi step form
  - Set Currency Selector to content auto width

V0.12
- User input form: Summary
  - Updated Accomodation to show price instead of title
   
V0.11
- User input form: Origin City
  - Origin City step added
  - Summary shows Origin City

V0.10
- User input form: UX
  - Navigation fixes

V0.9
- User input form: Summary
  - Summary takes actual user input and selected options.

V0.8
- User input form: Summary
  - Added edit button to each category

V0.7
- User input form: Time Step
  - Single choice selection for arrival time
  - Single choice selection for arrival time
    
- User input form: UX
  - Added emerald highlight styling when user selects an option


V0.6
- User input form: Summary step
  - Overview of all selected preferences
  - Clean card-based layout
  - Organized by categories


V0.5
- User input form: Preferences step
  - Text area for specific places and activities
  - Placeholder examples for better UX


V0.4
- User input form: Transport step
  - Multi choice selection buttons
 
- User input form: Budget step
  - Multi choice selection buttons


V0.3
- User input form: Restaurant step
  - Multi choice selection buttons
    

V0.2
- User input form: Hotel step
  - Single choice selection buttons
  - Added hotel input option

- User input form: Activity step
  - Multi choice selection buttons
    

V0.1
- User input form
  - Multi step format
  - Progress bar

- User input form: City step
    - Clean interface

- User input form: Arrival & Departure step
    - Calendar data range picker