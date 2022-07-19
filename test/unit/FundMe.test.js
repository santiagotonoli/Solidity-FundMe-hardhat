const {deployments, ethers, getNamedAccounts} = require("hardhat")
const { assert, expect } = require("chai")


describe("FundMe", async function (){

    let fundMe
    let deployer
    let mockV3Aggregator  
    const sendValue = ethers.utils.parseEther("1") // = 1 ETH = 1000000000000000000 WEI

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
        it("updated the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue})
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to array of funders", async function (){
            await fundMe.fund({value: sendValue})
            const funder = await fundMe.funders[1]
            assert.equal(funder, deployer)
        })

    })

    describe("withdraw", async function () {
        beforeEach(async function (){
            await fundMe.fund({value: sendValue})
        })

        it("Withdraw ETH from a single founder", async function (){
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })

    })

})