module.exports = class PlantSize {
    static NP = new PlantSize("NP");
    static LT_PT_ONE = new PlantSize("Less than 0.1m");
    static PT_ONE_TO_PT_FIVE = new PlantSize("0.1m to 0.5m");
    static PT_FIVE_TO_ONE = new PlantSize("0.5m to 1m");
    static ONE_TO_TWO = new PlantSize("1m to 2m");
    static TWO_TO_FOUR = new PlantSize("2m to 4m");
    static FOUR_TO_EIGHT = new PlantSize("4m to 8m");
    static GT_EIGHT = new PlantSize("Greater than 8m");

    constructor(name) {
        this.name = name;
    }
}