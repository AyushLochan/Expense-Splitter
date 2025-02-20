import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as Notifications from "expo-notifications";

const ExpenseSplitterApp = () => {
  const [participants, setParticipants] = useState(["Ayush", "Harsh", "Laxmikant", "Mudassir"]);
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");
  const [newParticipant, setNewParticipant] = useState("");

  const addExpense = () => {
    if (!description || !amount || !payer || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert("Invalid Input", "Please fill all fields correctly.");
      return;
    }

    if (!participants.includes(payer)) {
      Alert.alert("Invalid Payer", `${payer} is not in the participant list.`);
      return;
    }

    const expense = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      payer,
    };

    setExpenses([...expenses, expense]);
    setDescription("");
    setAmount("");
    setPayer("");
  };

  const calculateBalances = () => {
    const balances = {};

    participants.forEach((participant) => (balances[participant] = 0));

    expenses.forEach((expense) => {
      const perPerson = expense.amount / participants.length;
      participants.forEach((participant) => {
        if (participant === expense.payer) {
          balances[participant] += expense.amount - perPerson;
        } else {
          balances[participant] -= perPerson;
        }
      });
    });

    return balances;
  };

  const addParticipant = () => {
    if (!newParticipant || participants.includes(newParticipant)) {
      Alert.alert("Invalid Input", "Participant name is empty or already exists.");
      return;
    }

    setParticipants([...participants, newParticipant]);
    setNewParticipant("");
  };

  const removeParticipant = (participant) => {
    // Check if participant is involved in any expense
    const isParticipantInExpenses = expenses.some(
      (expense) => expense.payer === participant
    );

    if (isParticipantInExpenses) {
      Alert.alert(
        "Cannot Remove",
        `${participant} is involved in an expense and cannot be removed.`
      );
      return;
    }

    setParticipants(participants.filter((p) => p !== participant));
  };

  const clearExpenses = () => {
    setExpenses([]);
    Alert.alert("Success", "All expenses have been cleared.");
  };

  const sendNotification = async (message) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Expense Splitter Reminder",
        body: message,
      },
      trigger: null, // Trigger immediately
    });
  };

  const notifyBalances = () => {
    const balances = calculateBalances();
    Object.entries(balances).forEach(([participant, balance]) => {
      const message = `${participant} ${
        balance > 0 ? `is owed ₹${balance.toFixed(2)}` : `owes ₹${(-balance).toFixed(2)}`
      }`;
      sendNotification(message);
    });
    Alert.alert("Notifications Sent", "Balance notifications have been sent.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Expense Splitter</Text>

      {/* Add Participant */}
      <View style={styles.inputContainer}>
        <Text style={styles.subtitle}>Add Participant</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter participant name"
          value={newParticipant}
          onChangeText={setNewParticipant}
        />
        <TouchableOpacity style={styles.addButton} onPress={addParticipant}>
          <Text style={styles.buttonText}>Add Participant</Text>
        </TouchableOpacity>
      </View>

      {/* Participant List */}
      <View>
        <Text style={styles.subtitle}>Participants:</Text>
        {participants.map((participant) => (
          <View style={styles.participantItem} key={participant}>
            <Text style={styles.participantText}>{participant}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeParticipant(participant)}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Add Expense */}
      <View style={styles.inputContainer}>
        <Text style={styles.subtitle}>Add Expense</Text>
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Payer"
          value={payer}
          onChangeText={setPayer}
        />
        <TouchableOpacity style={styles.addButton} onPress={addExpense}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Expense List */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <Text style={styles.expenseText}>
              {item.description}: ${item.amount.toFixed(2)} paid by {item.payer}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses logged yet.</Text>
        }
      />

      {/* Balances */}
      <View style={styles.balanceContainer}>
        <Text style={styles.subtitle}>Balances:</Text>
        {Object.entries(calculateBalances()).map(([participant, balance]) => (
          <Text key={participant} style={styles.balanceText}>
            {participant}: {balance > 0 ? `Owed ₹${balance.toFixed(2)}` : `Owes ₹${(-balance).toFixed(2)}`}
          </Text>
        ))}
      </View>

      {/* Clear Expenses */}
      <TouchableOpacity style={styles.clearButton} onPress={clearExpenses}>
        <Text style={styles.buttonText}>Clear Expenses</Text>
      </TouchableOpacity>

      {/* Notify Button */}
      <TouchableOpacity style={styles.notifyButton} onPress={notifyBalances}>
        <Text style={styles.buttonText}>Send Balance Notifications</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#FF5722",
    padding: 5,
    borderRadius: 5,
  },
  removeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  participantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
  },
  participantText: {
    fontSize: 16,
  },
  expenseItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  expenseText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
  balanceContainer: {
    marginTop: 20,
  },
  balanceText: {
    fontSize: 16,
    marginBottom: 5,
  },
  clearButton: {
    backgroundColor: "#FF5722",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  notifyButton: {
    backgroundColor: "#03A9F4",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ExpenseSplitterApp;
