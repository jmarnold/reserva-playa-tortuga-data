import { defineWebComponent } from './webcomponent'
import { NestsByMonth } from './components/NestsByMonth'
import { NestsByBeach } from './components/NestsByBeach'
import { StatTiles } from './components/StatTiles'
import { ActivityBreakdown } from './components/ActivityBreakdown'

defineWebComponent('tortuga-nests-by-month', NestsByMonth)
defineWebComponent('tortuga-nests-by-beach', NestsByBeach)
defineWebComponent('tortuga-stat-tiles', StatTiles)
defineWebComponent('tortuga-activity-breakdown', ActivityBreakdown)
