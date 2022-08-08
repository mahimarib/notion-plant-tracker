declare namespace NodeJS {
    export interface ProcessEnv {
        NOTION_KEY: string,

        PLANTS_TABLE_ID: string,
        PLANTS_TABLE_DATE_ID: string,
        PLANTS_TABLE_NAME_ID: string,
        PLANTS_TABLE_INTERVAL_ID: string,
        PLANTS_TABLE_STATUS_ID: string,
        PLANTS_TABLE_LOCATION_ID: string,
        PLANTS_TABLE_GROUP_ID: string,
        
        ALIVE_STATUS: string,
        DEAD_STATUS: string,

        WATER_LOG_ID: string,
        WATER_LOG_NAME_ID: string,
        WATER_LOG_DATE_ID: string,
        WATER_LOG_METHOD_ID: string,

        WATERING_CAN_ID: string,
        RAIN_ID: string,

        FRONT_PAGE_ID: string,
        OPEN_WEATHER_KEY: string,
        LAT: number,
        LONG: number,

        PORT: number
    }
}