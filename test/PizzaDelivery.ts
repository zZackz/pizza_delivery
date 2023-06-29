import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("PizzMachine", function () {

    async function deployCoffeeMachineFixture() {
        const addresses = await ethers.getSigners();
        const PD = await ethers.getContractFactory("PizzaDelivery");
        const pd = await PD.deploy();

        return { pd, addresses };
    }

    it("should mint tokens for the user", async function () {
        const { pd, addresses } = await loadFixture(deployCoffeeMachineFixture);
        const [owner, addr1] = addresses;

        await expect(
            pd.connect(addr1).mintTokens({
                value: ethers.parseEther("0.0014"),
            })
        )
            .to.changeEtherBalances([owner, addr1], [0.001, -0.001]);

        expect(await pd.connect(addr1).getTokenBalance()).to.equal(2);
    });

    it("should not mint tokens for the owner", async function () {
        const { pd } = await loadFixture(deployCoffeeMachineFixture);

        await expect(
            pd.mintTokens({
                value: ethers.parseEther("0.001"),
            })
        ).to.be.revertedWith("cant mint tokens for the owner");
    });

    it("should not mint tokens if eth is less than 0.0005", async function () {
        const { pd, addresses } = await loadFixture(deployCoffeeMachineFixture);
        const [, addr1] = addresses;

        await expect(
            pd.connect(addr1).mintTokens({
                value: ethers.parseEther("0.0004"),
            })
        ).to.be.revertedWithCustomError(pd, "MinimumValue");
    });

    it("should transfer tokens from one user to another", async function () {
        const { pd, addresses } = await loadFixture(deployCoffeeMachineFixture);
        const [, addr1, addr2] = addresses;

        await pd.connect(addr1).mintTokens({
            value: ethers.parseEther("0.01"),
        });
        expect(await pd.connect(addr1).getTokenBalance()).to.equal(20);

        await pd.connect(addr1).transferTokens(addr2.address, 10);
        expect(await pd.connect(addr1).getTokenBalance()).to.equal(10);
        expect(await pd.connect(addr2).getTokenBalance()).to.equal(10);
    });

    it("should not transfer tokens if low balance", async function () {
        const { pd, addresses } = await loadFixture(deployCoffeeMachineFixture);
        const [, addr1, addr2] = addresses;

        await pd.connect(addr1).mintTokens({
            value: ethers.parseEther("0.01"),
        });
        expect(await pd.connect(addr1).getTokenBalance()).to.equal(20);

        await expect(
            pd.connect(addr1).transferTokens(addr2.address, 200)
        ).to.be.rejectedWith("account balance is low");
    });

    it("should return token balance", async function () {
        const { pd, addresses } = await loadFixture(deployCoffeeMachineFixture);
        const [, addr1] = addresses;

        await pd.connect(addr1).mintTokens({
            value: ethers.parseEther("0.001"),
        });
        expect(await pd.connect(addr1).getTokenBalance()).to.equal(2);
    });

    it("should purchase coffee", async function () {
        const { pd, addresses } = await loadFixture(deployCoffeeMachineFixture);
        const [, addr1] = addresses;

        await pd.connect(addr1).mintTokens({
            value: ethers.parseEther("0.001"),
        });
        expect(await pd.connect(addr1).getTokenBalance()).to.equal(2);
        await pd.connect(addr1).purchaseCoffee(1);
        expect(await pd.connect(addr1).getTokenBalance()).to.equal(1);
    });

    it("should not purchase coffee if low balance", async function () {
        const { pd, addresses } = await loadFixture(deployCoffeeMachineFixture);
        const [, addr1] = addresses;

        await pd.connect(addr1).mintTokens({
            value: ethers.parseEther("0.001"),
        });
        expect(await pd.connect(addr1).getTokenBalance()).to.equal(2);

        await expect(pd.connect(addr1).purchaseCoffee(3)).to.be.revertedWith(
            "account balance is low"
        );
    });
});