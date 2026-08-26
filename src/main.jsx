import { defineWebComponent } from './webcomponent'
import { NestsByMonth } from './components/NestsByMonth'
import { NestsByBeach } from './components/NestsByBeach'
import { StatTiles } from './components/StatTiles'
import { ActivityBreakdown } from './components/ActivityBreakdown'
import { YearOverYear } from './components/YearOverYear'
import { NestVsPoached } from './components/NestVsPoached'
import { SpeciesPhenology } from './components/SpeciesPhenology'
import { ClutchSizeBySpecies } from './components/ClutchSizeBySpecies'
import { BeachTrend } from './components/BeachTrend'

defineWebComponent('tortuga-nests-by-month', NestsByMonth)
defineWebComponent('tortuga-nests-by-beach', NestsByBeach)
defineWebComponent('tortuga-stat-tiles', StatTiles)
defineWebComponent('tortuga-activity-breakdown', ActivityBreakdown)
defineWebComponent('tortuga-year-over-year', YearOverYear)
defineWebComponent('tortuga-nest-vs-poached', NestVsPoached)
defineWebComponent('tortuga-species-phenology', SpeciesPhenology)
defineWebComponent('tortuga-clutch-size', ClutchSizeBySpecies)
defineWebComponent('tortuga-beach-trend', BeachTrend)
