import * as Msdyn365 from '@msdyn365-commerce/core';

//https://api.openweathermap.org/data/2.5/group?units=${first.units}&lang=en&appid=${first.apiKey}&id=${ids}`
//https://api.openweathermap.org/data/2.5/group?units=metric&lang=en&appid=20d86600c995ba23fad03e1a291fa9b9&id=5128581,2643743,2950159
export interface IWeatherConditions {
    name: string; // City name
    id: string; // City ID
    dt: number; // Time of data calculation, unix, UTC
    weather: [
        {
            id: number; // Weather condition id
            main: string; // Group of weather parameters (Rain, Snow, Extreme etc.)
            description: string; // Weather condition within the group
            icon: string; // Weather icon id
        }
    ];
    main: {
        temp: number; // Temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
        temp_min: number; // Minimum temperature at the moment of calculation. This is deviation from 'temp' that is possible for large cities and megalopolises geographically expanded (use these parameter optionally).
        temp_max: number; // Maximum temperature at the moment of calculation. This is deviation from 'temp' that is possible for large cities and megalopolises geographically expanded (use these parameter optionally).
    };
}

export interface IWeatherConditionsList {
    list: IWeatherConditions[];
    cnt: number;
}

export interface ILocation {
    id: string;
    name: string;
}

export class OpenWeatherApiInput implements Msdyn365.IActionInput {
    public readonly location: ILocation;
    public readonly apiKey: string;
    public readonly units: string;
    private readonly language: string;

    constructor(apiKey: string, location: ILocation, language?: string, units?: string) {
        this.location = location;
        this.apiKey = apiKey;
        this.language = language || 'en';
        this.units = units === 'c' || units === 'C' ? 'metric' : 'imperial';
    }

    public getCacheKey = () => `Weather-${this.language}-${this.units}-${this.location.id}`;
    public getCacheObjectType = () => 'open-weather-map-object';
    public dataCacheType = (): Msdyn365.CacheType => 'application';
}

async function action(input: OpenWeatherApiInput[], ctx: Msdyn365.IActionContext): Promise<IWeatherConditions[]> {
    if (!input || !input.length || !input[0].apiKey) {
        ctx.telemetry.error('Invalid API key, returning empty array');
        return [];
    }

    const first = input[0];
    const ids = input.map(i => i.location.id).join(',');
    const url = `https://api.openweathermap.org/data/2.5/group?units=${first.units}&lang=en&appid=${first.apiKey}&id=${ids}`;

    await new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });

    if (typeof window === 'undefined') {
        const response = await Msdyn365.sendRequest<IWeatherConditionsList>(url, 'get');
        return response.data.list;
    } else {
        const response = await fetch(url);
        if (response && response.ok) {
            const data = <IWeatherConditionsList>await response.json();
            return data.list;
        }
        return [];
    }
}

export default Msdyn365.createObservableDataAction({
    action: <Msdyn365.IAction<IWeatherConditions[]>>action,
    id: 'get-current-weather-conditions',
    isBatched: true
});
