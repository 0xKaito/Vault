// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.24;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vault is Ownable {
    using SafeERC20 for IERC20;

    address public weth;

    /// user deposited token amount
    mapping(address => mapping(address => uint256)) public userTokenAmount;

    /// @notice Emitted when a token is deposited
    /// @param user The address of the user depositing the token
    /// @param token The address of the token being deposited
    /// @param amount The amount of the token being deposited
    event TokenDeposited(address indexed user, address indexed token, uint256 amount);

    /// @notice Emitted when ETH is wrapped into WETH
    /// @param user The address of the user wrapping ETH
    /// @param amount The amount of ETH being wrapped
    event ETHWrapped(address indexed user, uint256 amount);

    /// @notice Emitted when WETH is unwrapped into ETH
    /// @param user The address of the user unwrapping WETH
    /// @param amount The amount of WETH being unwrapped
    event WETHUnwrapped(address indexed user, uint256 amount);

    /// @notice Emitted when a token is withdrawn
    /// @param user The address of the user withdrawing the token
    /// @param token The address of the token being withdrawn
    /// @param amount The amount of the token being withdrawn
    event TokenWithdrawn(address indexed user, address indexed token, uint256 amount);

    /// @notice Emitted when a token is withdrawn
    /// @param owner The address of the owner withdrawing the token
    /// @param reciever The address of the reciever
    /// @param amount The amount of the token being withdrawn
    event WrappedTokenWithdrawn(address indexed owner, address indexed reciever, uint256 amount);

    /**
     * @notice Constructor to set the WETH token address
     * @param _weth The address of the WETH token
     */
    constructor(address _weth, address _admin) Ownable(_admin) {
        weth = _weth;
    }

    /**
     * @notice Deposit tokens into the vault
     * if zero address provided in tokenAddress, then eth wiil deposit
     * @param _tokenAddress The address of the token to deposit
     * @param _amount The amount of the token to deposit
     */
    function depositToken(address _tokenAddress, uint256 _amount) external payable {
        if (_tokenAddress == address(0)) {
            require(msg.value >= _amount, "Vault: Insufficient funds");
        } else {
            IERC20(_tokenAddress).safeTransferFrom(msg.sender, address(this), _amount);
        }
    
        userTokenAmount[_tokenAddress][msg.sender] += _amount;
        emit TokenDeposited(msg.sender, _tokenAddress, _amount);
    }

    /**
     * @notice Wrap ETH into WETH
     * @param _amount The amount of ETH to wrap
     */
    function wrapETH(uint256 _amount) external {
        require(userTokenAmount[address(0)][msg.sender] >= _amount, "Vault: wrapped amount more than eth deposited");
        userTokenAmount[address(0)][msg.sender] -= _amount;
        userTokenAmount[weth][msg.sender] += _amount;

        IERC20(weth).safeTransfer(msg.sender, _amount);
        emit ETHWrapped(msg.sender, _amount);
    }

    /**
     * @notice Unwrap WETH into ETH
     * @param _amount The amount of WETH to unwrap
     */
    function unwrapWETH(uint256 _amount) external {
        require(userTokenAmount[address(weth)][msg.sender] >= _amount, "Vault: unwrapped amount exceed");
        userTokenAmount[weth][msg.sender] -= _amount;
        userTokenAmount[address(0)][msg.sender] += _amount;

        IERC20(weth).safeTransferFrom(msg.sender, address(this), _amount);
        emit WETHUnwrapped(msg.sender, _amount);
    }

    /**
     * @notice Withdraw tokens from the vault
     * if zero address in passed in token then eth will withdraw
     * @param _token The address of the token to withdraw
     * @param _amount The amount of the token to withdraw
     */
    function withdrawToken(address _token, uint256 _amount) external payable {
        require(userTokenAmount[_token][msg.sender] >= _amount, "Vault: withdraw amount exceed");
        userTokenAmount[_token][msg.sender] -= _amount;

        if (_token == address(0)) {
            (bool sent, ) = payable(msg.sender).call{value: _amount}("");
            require(sent, "Failed to send Ether");
        } else {
            IERC20(_token).transfer(msg.sender, _amount);
        }

        emit TokenWithdrawn(msg.sender, _token, _amount);
    }

    function withdrawWrappedETH(uint256 _amount, address _to) external onlyOwner {
        IERC20(weth).safeTransfer(_to, _amount);

        emit WrappedTokenWithdrawn(msg.sender, _to, _amount);
    }
}