const { expect } = require("chai")
const { ethers } = require("hardhat")
const { parseEther } = require('ethers');

describe("SingleSidedInsurance claim policy", function () {
  before(async function () {
    this.Vault = await ethers.getContractFactory("Vault");
    this.WETH = await ethers.getContractFactory("MockWETH");
    this.MockToken = await ethers.getContractFactory("MockToken");
  })

  beforeEach(async function () {
    this.signers = await ethers.getSigners();
    this.weth = await this.WETH.deploy("WETHToken", "WETH", this.signers[0].address);
    this.vault = await this.Vault.deploy(this.weth.target, this.signers[0].address);
    this.mockToken = await this.MockToken.deploy("MyToken", "MYT");
    this.addressZero = "0x0000000000000000000000000000000000000000"
  })

  describe("Vault funtions", function () {

    describe("Vault deposit", function () {
      it("Should deposit user ERC20 token", async function () {
        await this.mockToken.mint(this.signers[0].address, 100);
        await this.mockToken.approve(this.vault.target, 100);
    
        await expect(this.vault.depositToken(this.mockToken.target, 100)).to.emit(this.vault, "TokenDeposited").withArgs(this.signers[0].address, this.mockToken.target, 100)

        expect(await this.vault.userTokenAmount(this.mockToken.target, this.signers[0].address)).to.equal(100);
        expect(await this.mockToken.balanceOf(this.vault.target)).to.equal(100);
      })

      it("Should deposit user ETH", async function () {
        await expect(this.vault.depositToken(this.addressZero, parseEther("1"), {value: parseEther("1")})).to.emit(this.vault, "TokenDeposited").withArgs(this.signers[0].address, this.addressZero, parseEther("1"))

        expect(await this.vault.userTokenAmount(this.addressZero, this.signers[0].address)).to.equal(parseEther("1"));
      })

      it("Should revert without giving approval of token to vault", async function () {
        await this.mockToken.mint(this.signers[0].address, 100);
        await expect(this.vault.depositToken(this.mockToken.target, 100)).to.be.revertedWithCustomError(this.mockToken, "ERC20InsufficientAllowance");
      })

      it("Should revert when insufficient eth passed compared to amount", async function () {
        await this.mockToken.mint(this.signers[0].address, 100);
        await expect(this.vault.depositToken(this.addressZero, 100)).to.be.revertedWith("Vault: Insufficient funds");
      })
    })

    describe("Vault withdraw", function () {
        beforeEach(async function () {
            await this.mockToken.mint(this.signers[0].address, 100);
            await this.mockToken.approve(this.vault.target, 100);
    
            await this.vault.depositToken(this.mockToken.target, 100);
            await this.vault.depositToken(this.addressZero, parseEther("1"), {value: parseEther("1")})
          })
        it("Should withdraw user deposited ERC20 token", async function () {
      
            expect(await this.mockToken.balanceOf(this.vault.target)).to.equal(100);
            await expect(this.vault.withdrawToken(this.mockToken.target, 100)).to.emit(this.vault, "TokenWithdrawn").withArgs(this.signers[0].address, this.mockToken.target, 100)
            expect(await this.vault.userTokenAmount(this.mockToken.target, this.signers[0].address)).to.equal(0);
            expect(await this.mockToken.balanceOf(this.vault.target)).to.equal(0);
        })
  
        it("Should withdraw user deposited ETH", async function () {
            await expect(this.vault.withdrawToken(this.addressZero, parseEther("1"))).to.emit(this.vault, "TokenWithdrawn").withArgs(this.signers[0].address, this.addressZero, parseEther("1"))
  
            expect(await this.vault.userTokenAmount(this.addressZero, this.signers[0].address)).to.equal(0);
        })
  
        it("Should revert for withdrawing extra token", async function () {
            await expect(this.vault.withdrawToken(this.mockToken.target, 200)).to.be.revertedWith("Vault: withdraw amount exceed");
        })
      })

      describe("Vault wrap", function () {
        beforeEach(async function () {
            await this.weth.mint(this.vault.target, parseEther("1"));
            await this.vault.depositToken(this.addressZero, parseEther("1"), {value: parseEther("1")});
        })

        it("Should able to wrap ETH", async function () {
            await expect(this.vault.wrapETH(parseEther("1"))).to.emit(this.vault, "ETHWrapped").withArgs(this.signers[0].address, parseEther("1"));
            expect(await this.vault.userTokenAmount(this.weth.target, this.signers[0].address)).to.equal(parseEther("1"));
        })
  
        it("Should revert when user try to wrap more than deposited ETH", async function () {
            await expect(this.vault.wrapETH(parseEther("2"))).to.be.revertedWith("Vault: wrapped amount more than eth deposited");
        })
      })

      describe("Vault unwrap", function () {
        beforeEach(async function () {
            await this.weth.mint(this.vault.target, parseEther("1"));
            await this.vault.depositToken(this.addressZero, parseEther("1"), {value: parseEther("1")});
            await this.vault.wrapETH(parseEther("1"));
        })

        it("Should able to wrap ETH", async function () {
            await this.weth.approve(this.vault.target, parseEther("1"));
            await expect(this.vault.unwrapWETH(parseEther("1"))).to.emit(this.vault, "WETHUnwrapped").withArgs(this.signers[0].address, parseEther("1"));
            expect(await this.vault.userTokenAmount(this.weth.target, this.signers[0].address)).to.equal(0);
        })
  
        it("Should revert when user try to unwrap more than wrapped ETH", async function () {
            await expect(this.vault.unwrapWETH(parseEther("2"))).to.be.revertedWith("Vault: unwrapped amount exceed");
        })
      })
  })
})
