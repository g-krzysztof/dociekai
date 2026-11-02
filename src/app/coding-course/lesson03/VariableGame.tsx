'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Value {
  id: string;
  content: string;
  correctVariable: string;
  type: 'number' | 'string' | 'boolean';
}

interface Variable {
  name: string;
  label: string;
  type: 'number' | 'string' | 'boolean';
  acceptedValues: string[];
}

const values: Value[] = [
  { id: 'v1', content: '7', correctVariable: 'wiek', type: 'number' },
  { id: 'v2', content: 'Ania', correctVariable: 'imię', type: 'string' },
  { id: 'v3', content: 'prawda', correctVariable: 'maZwierzaka', type: 'boolean' },
  { id: 'v4', content: 'Tomek', correctVariable: 'imię', type: 'string' },
  { id: 'v5', content: '8', correctVariable: 'wiek', type: 'number' },
  { id: 'v6', content: 'fałsz', correctVariable: 'maZwierzaka', type: 'boolean' },
];

const variables: Variable[] = [
  { name: 'wiek', label: 'wiek (liczba lat)', type: 'number', acceptedValues: ['7', '8'] },
  { name: 'imię', label: 'imię (tekst)', type: 'string', acceptedValues: ['Ania', 'Tomek'] },
  { name: 'maZwierzaka', label: 'czy ma zwierzątko (prawda/fałsz)', type: 'boolean', acceptedValues: ['prawda', 'fałsz'] },
];

export const VariableGame = () => {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [draggedValue, setDraggedValue] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDragStart = (valueId: string) => {
    setDraggedValue(valueId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (variableName: string) => {
    if (draggedValue) {
      setAssignments((prev) => ({ ...prev, [variableName]: draggedValue }));
      setDraggedValue(null);
      setChecked(false);
    }
  };

  const handleCheck = () => {
    setChecked(true);
    const allCorrect = variables.every((variable) => {
      const assignedValueId = assignments[variable.name];
      if (!assignedValueId) return false;
      const value = values.find((v) => v.id === assignedValueId);
      return value && value.correctVariable === variable.name;
    });
    if (allCorrect) {
      setShowSuccess(true);
    }
  };

  const handleReset = () => {
    setAssignments({});
    setChecked(false);
    setShowSuccess(false);
  };

  const getAssignedValue = (variableName: string) => {
    const valueId = assignments[variableName];
    if (!valueId) return null;
    return values.find((v) => v.id === valueId);
  };

  const isValueAssigned = (valueId: string) => {
    return Object.values(assignments).includes(valueId);
  };

  const isCorrectAssignment = (variableName: string) => {
    const value = getAssignedValue(variableName);
    return value && value.correctVariable === variableName;
  };

  return (
    <div className="max-w-[1336px] mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left side - Values to drag */}
        <div className="bg-card rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Wartości do przypisania</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Przeciągnij wartości do odpowiednich pudełek (zmiennych)
          </p>
          <div className="grid grid-cols-2 gap-4">
            {values.map((value) => (
              <div
                key={value.id}
                draggable={!isValueAssigned(value.id)}
                onDragStart={() => handleDragStart(value.id)}
                className={`p-4 rounded-lg border-2 text-center font-semibold cursor-grab active:cursor-grabbing
                  ${isValueAssigned(value.id) ? 'opacity-30 cursor-not-allowed' : 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900'}
                  ${value.type === 'number' ? 'text-blue-700 dark:text-blue-300' : ''}
                  ${value.type === 'string' ? 'text-purple-700 dark:text-purple-300' : ''}
                  ${value.type === 'boolean' ? 'text-green-700 dark:text-green-300' : ''}
                `}
              >
                <div className="text-2xl mb-1">{value.content}</div>
                <div className="text-xs text-muted-foreground">
                  {value.type === 'number' ? '(liczba)' : ''}
                  {value.type === 'string' ? '(tekst)' : ''}
                  {value.type === 'boolean' ? '(prawda/fałsz)' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Variable boxes */}
        <div className="bg-card rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Zmienne (pudełka)</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upuść wartości tutaj
          </p>
          <div className="space-y-4">
            {variables.map((variable) => {
              const assignedValue = getAssignedValue(variable.name);
              const isCorrect = checked && isCorrectAssignment(variable.name);
              const isIncorrect = checked && assignedValue && !isCorrect;

              return (
                <div
                  key={variable.name}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(variable.name)}
                  className={`p-6 rounded-lg border-2 border-dashed min-h-[100px] flex flex-col items-center justify-center
                    ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
                    ${isIncorrect ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}
                    ${!checked ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
                  `}
                >
                  <div className="text-lg font-mono font-bold mb-2 text-gray-700 dark:text-gray-300">
                    {variable.name}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {variable.label}
                  </div>
                  {assignedValue ? (
                    <div className="flex flex-col items-center">
                      <div className={`text-3xl font-bold mb-2 ${
                        variable.type === 'number' ? 'text-blue-700 dark:text-blue-300' : ''
                      }${
                        variable.type === 'string' ? 'text-purple-700 dark:text-purple-300' : ''
                      }${
                        variable.type === 'boolean' ? 'text-green-700 dark:text-green-300' : ''
                      }`}>
                        {assignedValue.content}
                      </div>
                      {checked && (
                        <div className="text-sm">
                          {isCorrect ? '✅ Dobrze!' : '❌ Źle'}
                        </div>
                      )}
                      {!checked && (
                        <button
                          onClick={() => {
                            const newAssignments = { ...assignments };
                            delete newAssignments[variable.name];
                            setAssignments(newAssignments);
                          }}
                          className="mt-2 text-xs text-red-500 hover:text-red-700"
                        >
                          Usuń
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 dark:text-gray-600 text-sm">Upuść wartość tutaj</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={handleCheck}
              disabled={Object.keys(assignments).length !== variables.length}
              className="flex-1"
            >
              Sprawdź
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg max-w-sm text-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <h3 className="text-xl font-semibold mb-2">🎉 Brawo!</h3>
              <p className="mt-2">
                Świetnie! Wszystkie wartości zostały przypisane do odpowiednich zmiennych!
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Teraz rozumiesz, jak działają zmienne w programowaniu!
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button onClick={() => setShowSuccess(false)}>Zamknij</Button>
                <Button onClick={handleReset} variant="outline">
                  Zagraj ponownie
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
