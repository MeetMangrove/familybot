import giveMood from '../methods/convo/give_mood'
import controller from '../config'

controller.hears('mood', 'direct_message', giveMood)
