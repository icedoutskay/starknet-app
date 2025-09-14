#[starknet::interface]
trait ICounter<T> {
  fn get_counter(self: @T) -> u32;
  fn increase_counter(ref self: T);
  fn decrease_counter(ref self: T);
  fn set_counter(ref self: T, new_value: u32);
  fn reset_counter(ref self: T);
}

#[starknet::contract]
pub mod Counter {
  use super::ICounter;
  use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
  use starknet::{ContractAddress, get_caller_address, get_contract_address};
  use openzeppelin_access::ownable::OwnableComponent;
  use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
  use contracts::utils::{strk_address, strk_to_fri};

  component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        CounterChanged: CounterChanged,
            #[flat]
        OwnableEvent: OwnableComponent::Event,
     }
     
      #[derive(Drop, starknet::Event)]
    pub struct CounterChanged {
          #[key]
         pub caller: ContractAddress,
         pub  old_value: u32,
         pub new_value: u32,
         pub reason: ChangeReason
     }
     
     #[derive(Drop, Copy, Serde)]
    pub enum ChangeReason {
          Increase,
          Decrease,
          Set,
          Reset,
     }
      
        #[storage]
    struct Storage {
        counter: u32,
        // owner: ContractAddress,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

      #[constructor]
    fn constructor(ref self: ContractState, init_value: u32, owner: ContractAddress) {
        self.counter.write(init_value);
        self.ownable.initializer(owner);
        // self.owner.write(owner);
    }

    #[abi(embed_v0)]
    impl CounterImpl of ICounter<ContractState> {
        fn get_counter(self: @ContractState) -> u32 {
            self.counter.read()
        }
        fn increase_counter(ref self: ContractState) {
            let current_counter = self.counter.read();
            let new_counter = current_counter + 1;
            self.counter.write(new_counter);
            let event:CounterChanged = CounterChanged {
                caller: get_caller_address(),
                old_value: current_counter,
                new_value: new_counter,
                reason: ChangeReason::Increase,
            }; 
            self.emit(event);
        }
        fn decrease_counter(ref self: ContractState) {
            let current_counter = self.counter.read();
            assert!(current_counter > 0, "Counter cannot be negative");
            let new_counter = current_counter - 1;
            self.counter.write(new_counter);
            let event:CounterChanged = CounterChanged {
                caller: get_caller_address(),
                old_value: current_counter,
                new_value: new_counter,
                reason: ChangeReason::Decrease,
            }; 
            self.emit(event);
        }
        fn set_counter(ref self: ContractState, new_value: u32) {
            self.ownable.assert_only_owner();
            let current_counter = self.counter.read();
            self.counter.write(new_value);
            let event:CounterChanged = CounterChanged {
                caller: get_caller_address(),
                old_value: current_counter,
                new_value: new_value,
                reason: ChangeReason::Set,
            }; 
            self.emit(event);
        }

        fn reset_counter(ref self: ContractState) {
            let payment_amount: u256 = strk_to_fri(1);
            let strk_token: ContractAddress = strk_address();
            let caller = get_caller_address();
            let contract = get_contract_address();
        
            let dispatcher = IERC20Dispatcher { contract_address: strk_token };

            let balance =dispatcher.balance_of(caller);
            assert!(balance >= payment_amount, "Insufficient STRK balance to reset counter");

            let allowance = dispatcher.allowance(caller, contract);
            assert!(allowance >= payment_amount, "Contract is not approved to spend required STRK amount");

           let owner = self.ownable.owner();
           let success = dispatcher.transfer_from(caller, owner, payment_amount);
              assert!(success, "STRK transfer failed");

            let current_counter = self.counter.read();
            self.counter.write(0);
            let event:CounterChanged = CounterChanged {
                caller: caller,
                old_value: current_counter,
                new_value: 0,
                reason: ChangeReason::Reset,
            }; 
            self.emit(event);
        }
  }
  }
  
   
  




































































































// #[starknet::interface]
// pub trait IYourContract<TContractState> {
//     fn greeting(self: @TContractState) -> ByteArray;
//     fn set_greeting(ref self: TContractState, new_greeting: ByteArray, amount_strk: Option<u256>);
//     fn withdraw(ref self: TContractState);
//     fn premium(self: @TContractState) -> bool;
// }

// #[starknet::contract]
// pub mod YourContract {
//     use openzeppelin_access::ownable::OwnableComponent;
//     use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
//     use starknet::storage::{
//         Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
//         StoragePointerWriteAccess,
//     };
//     use starknet::{ContractAddress, get_caller_address, get_contract_address};
//     use super::IYourContract;

//     component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

//     #[abi(embed_v0)]
//     impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
//     impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

//     pub const FELT_STRK_CONTRACT: felt252 =
//         0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d;

//     #[event]
//     #[derive(Drop, starknet::Event)]
//     enum Event {
//         #[flat]
//         OwnableEvent: OwnableComponent::Event,
//         GreetingChanged: GreetingChanged,
//     }

//     #[derive(Drop, starknet::Event)]
//     struct GreetingChanged {
//         #[key]
//         greeting_setter: ContractAddress,
//         #[key]
//         new_greeting: ByteArray,
//         premium: bool,
//         value: Option<u256>,
//     }

//     #[storage]
//     struct Storage {
//         greeting: ByteArray,
//         premium: bool,
//         total_counter: u256,
//         user_greeting_counter: Map<ContractAddress, u256>,
//         #[substorage(v0)]
//         ownable: OwnableComponent::Storage,
//     }

//     #[constructor]
//     fn constructor(ref self: ContractState, owner: ContractAddress) {
//         self.greeting.write("Building Unstoppable Apps!!!");
//         self.ownable.initializer(owner);
//     }

//     #[abi(embed_v0)]
//     impl YourContractImpl of IYourContract<ContractState> {
//         fn greeting(self: @ContractState) -> ByteArray {
//             self.greeting.read()
//         }
//         fn set_greeting(
//             ref self: ContractState, new_greeting: ByteArray, amount_strk: Option<u256>,
//         ) {
//             self.greeting.write(new_greeting);
//             self.total_counter.write(self.total_counter.read() + 1);
//             let user_counter = self.user_greeting_counter.read(get_caller_address());
//             self.user_greeting_counter.write(get_caller_address(), user_counter + 1);

//             match amount_strk {
//                 Option::Some(amount_strk) => {
//                     // In `Debug Contract` or UI implementation, call `approve` on STRK contract
//                     // before invoking fn set_greeting()
//                     let strk_contract_address: ContractAddress = FELT_STRK_CONTRACT
//                         .try_into()
//                         .unwrap();
//                     let strk_dispatcher = IERC20Dispatcher {
//                         contract_address: strk_contract_address,
//                     };
//                     strk_dispatcher
//                         .transfer_from(get_caller_address(), get_contract_address(), amount_strk);
//                     self.premium.write(true);
//                 },
//                 Option::None => { self.premium.write(false); },
//             }
//             self
//                 .emit(
//                     GreetingChanged {
//                         greeting_setter: get_caller_address(),
//                         new_greeting: self.greeting.read(),
//                         premium: true,
//                         value: amount_strk,
//                     },
//                 );
//         }
//         fn withdraw(ref self: ContractState) {
//             self.ownable.assert_only_owner();
//             let strk_contract_address = FELT_STRK_CONTRACT.try_into().unwrap();
//             let strk_dispatcher = IERC20Dispatcher { contract_address: strk_contract_address };
//             let balance = strk_dispatcher.balance_of(get_contract_address());
//             strk_dispatcher.transfer(self.ownable.owner(), balance);
//         }
//         fn premium(self: @ContractState) -> bool {
//             self.premium.read()
//         }
//     }
// }
