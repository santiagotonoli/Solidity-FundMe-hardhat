const {deployments, ethers, getNamedAccounts} = require("hardhat")
const { assert, expect } = require("chai")


describe("FundMe", async function (){

    let fundMe
    let deployer
    let mockV3Aggregator  

    beforeEach(async function (){
        deployer = (await getNamedAccounts()).deployer
        //fixture function permet de run tous les fichiers du folder deploy selon les tags que l'on veut
        await deployments.fixture(["all"])
        //getContract function will get most recent deployment of the contract that we ask
        fundMe = await ethers.getContract("FundMe", deployer) 
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
        

    })

    describe("constructor", async function (){
        it("sets the aggregator addresses correctly", async function (){
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function(){
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })

    })

})