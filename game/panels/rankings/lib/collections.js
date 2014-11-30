if (Meteor.isClient) {
	RankingsAllies = new Mongo.Collection('ally_rankings')
	RankingsNetworth = new Mongo.Collection('networth_rankings')
	RankingsIncome = new Mongo.Collection('income_rankings')
	RankingsLostSoldiers = new Mongo.Collection('losses_rankings')
	RankingsDominus = new Mongo.Collection('dominus_rankings')
}