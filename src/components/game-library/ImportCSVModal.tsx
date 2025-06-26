'use client';

import { useState } from 'react';
import { CSVImportOptions, GameCSVMapping } from '@/types/game-library-types';
import { useGameLibrary } from '@/store/game-library-store';

interface ImportCSVModalProps {
  onClose: () => void;
}

export default function ImportCSVModal({ onClose }: ImportCSVModalProps) {
  const [csvData, setCsvData] = useState('');
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'result'>('upload');
  const [csvLines, setCsvLines] = useState<string[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importOptions, setImportOptions] = useState<CSVImportOptions>({
    skipFirstRow: true,
    mapping: {
      title: '',
      maxPlayers: '',
      minPlayers: '',
      link: '',
      image: '',
      description: '',
      category: '',
      designer: '',
      publisher: '',
      yearPublished: '',
      complexity: '',
      playingTime: '',
      tags: ''
    },
    tagSeparator: ',',
    overwriteExisting: false
  });
  const [importResult, setImportResult] = useState<{ success: boolean; imported: number; errors: string[] } | null>(null);

  const { importFromCSV } = useGameLibrary();

  // Auto-mapping function to match headers to fields
  const autoMapHeaders = (headers: string[]): GameCSVMapping => {
    const mapping: GameCSVMapping = {
      title: '',
      maxPlayers: '',
      minPlayers: '',
      link: '',
      image: '',
      description: '',
      category: '',
      designer: '',
      publisher: '',
      yearPublished: '',
      complexity: '',
      playingTime: '',
      tags: ''
    };

    // Define mapping patterns - order matters (more specific first)
    const patterns = {
      title: [
        'game name', 'game title', 'name', 'title', 'gamename', 'gametitle', 
        'game_name', 'game_title', 'boardgame', 'board game'
      ],
      maxPlayers: [
        'max players', 'maximum players', 'maxplayers', 'max_players', 
        'player count max', 'players max', 'max player count', 'max. players',
        'players', 'player count', '#players', 'num players'
      ],
      minPlayers: [
        'min players', 'minimum players', 'minplayers', 'min_players',
        'player count min', 'players min', 'min player count', 'min. players'
      ],
      category: [
        'category', 'categories', 'genre', 'genres', 'type', 'game type',
        'mechanic', 'mechanics', 'theme', 'themes'
      ],
      designer: [
        'designer', 'designers', 'game designer', 'author', 'authors',
        'creator', 'creators', 'designed by', 'design', 'artist'
      ],
      publisher: [
        'publisher', 'publishers', 'published by', 'company', 'publisher name',
        'publishing company', 'pub', 'brand'
      ],
      yearPublished: [
        'year published', 'year', 'published', 'release year', 'publication year',
        'yearpublished', 'year_published', 'date published', 'release date',
        'pub year', 'copyright'
      ],
      complexity: [
        'complexity', 'difficulty', 'weight', 'complexity rating',
        'difficulty rating', 'game weight', 'bgg weight'
      ],
      playingTime: [
        'playing time', 'time', 'playtime', 'duration', 'game length',
        'playingtime', 'playing_time', 'play time', 'game time',
        'minutes', 'length', 'game duration'
      ],
      description: [
        'description', 'desc', 'summary', 'overview', 'about',
        'game description', 'synopsis', 'details', 'notes'
      ],
      tags: [
        'tags', 'tag', 'keywords', 'labels', 'mechanics', 'themes',
        'categories', 'genre', 'classification'
      ],
      link: [
        'link', 'url', 'website', 'web site', 'bgg link', 'boardgamegeek',
        'game link', 'boardgamegeek link', 'bgg url', 'external link'
      ],
      image: [
        'image', 'img', 'picture', 'pic', 'photo', 'thumbnail', 'thumb',
        'image url', 'img url', 'picture url', 'cover', 'box art'
      ]
    };

    // For each header, find the best matching field
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();
      
      // Find the best match
      for (const [field, keywords] of Object.entries(patterns)) {
        // Skip if this field is already mapped
        if (mapping[field as keyof GameCSVMapping]) {
          continue;
        }
        
        // Check if this header matches any keyword for this field
        let foundMatch = false;
        for (const keyword of keywords) {
          if (normalizedHeader === keyword || normalizedHeader.includes(keyword)) {
            mapping[field as keyof GameCSVMapping] = index.toString();
            foundMatch = true;
            break; // Break out of keyword loop
          }
        }
        
        // If we found a match for this field, stop checking other fields for this header
        if (foundMatch) {
          break;
        }
      }
    });

    return mapping;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
        const lines = text.split('\n').filter(line => line.trim());
        setCsvLines(lines);
        if (lines.length > 0) {
          // Parse first line as potential headers
          const firstLine = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          setHeaders(firstLine);
          
          // Auto-map the headers
          const autoMapping = autoMapHeaders(firstLine);
          setImportOptions(prev => ({
            ...prev,
            mapping: autoMapping
          }));
        }
        setStep('mapping');
      };
      reader.readAsText(file);
    }
  };

  const handleTextInput = () => {
    if (csvData.trim()) {
      const lines = csvData.split('\n').filter(line => line.trim());
      setCsvLines(lines);
      if (lines.length > 0) {
        const firstLine = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        setHeaders(firstLine);
        
        // Auto-map the headers
        const autoMapping = autoMapHeaders(firstLine);
        setImportOptions(prev => ({
          ...prev,
          mapping: autoMapping
        }));
      }
      setStep('mapping');
    }
  };

  const handleMappingChange = (field: keyof GameCSVMapping, columnIndex: string) => {
    setImportOptions(prev => ({
      ...prev,
      mapping: {
        ...prev.mapping,
        [field]: columnIndex
      }
    }));
  };

  const handleImport = () => {
    const result = importFromCSV(csvData, importOptions);
    setImportResult(result);
    setStep('result');
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Import Games from CSV</h3>
        <p className="text-gray-600 mb-4">
          Choose a CSV file or paste CSV data to import games into your library.
        </p>
      </div>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="text-center text-gray-500">
        <span>or</span>
      </div>

      {/* Text input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste CSV Data
        </label>
        <textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Title,Max Players,Category&#10;Catan,4,Strategy&#10;Ticket to Ride,5,Family"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleTextInput}
          disabled={!csvData.trim()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue with Pasted Data
        </button>
      </div>

      {/* CSV format guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Required columns: Title, Max Players</li>
          <li>• Optional columns: Min Players, Category, Designer, Publisher, etc.</li>
          <li>• Use comma separators between values</li>
          <li>• Include headers in the first row (recommended)</li>
          <li>• Enclose values with commas in quotes</li>
        </ul>
      </div>
    </div>
  );

  const renderMappingStep = () => {
    // Check if auto-mapping was successful for required fields
    const autoMappedFields = Object.entries(importOptions.mapping)
      .filter(([_, value]) => value !== '')
      .map(([field, _]) => field);
    
    const hasRequiredMappings = importOptions.mapping.title && importOptions.mapping.maxPlayers;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Map CSV Columns</h3>
          <p className="text-gray-600 mb-4">
            Match your CSV columns to game fields. Title and Max Players are required.
          </p>
          
          {/* Auto-mapping status */}
          {autoMappedFields.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">🎯</span>
                  <span className="text-sm font-medium text-blue-800">
                    Auto-mapped {autoMappedFields.length} field{autoMappedFields.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const autoMapping = autoMapHeaders(headers);
                      setImportOptions(prev => ({
                        ...prev,
                        mapping: autoMapping
                      }));
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Re-run Auto-mapping
                  </button>
                  <button
                    onClick={() => setImportOptions(prev => ({
                      ...prev,
                      mapping: {
                        title: '',
                        maxPlayers: '',
                        minPlayers: '',
                        link: '',
                        image: '',
                        description: '',
                        category: '',
                        designer: '',
                        publisher: '',
                        yearPublished: '',
                        complexity: '',
                        playingTime: '',
                        tags: ''
                      }
                    }))}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="text-xs text-blue-700 mt-1">
                Detected: {autoMappedFields.join(', ')}
                {!hasRequiredMappings && ' (Please verify required fields)'}
              </div>
            </div>
          )}
        </div>

        {/* Import options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={importOptions.skipFirstRow}
            onChange={(e) => setImportOptions(prev => ({ ...prev, skipFirstRow: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">Skip first row (headers)</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={importOptions.overwriteExisting}
            onChange={(e) => setImportOptions(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">Overwrite existing games</span>
        </label>
      </div>

      {/* Column mapping */}
      <div className="space-y-4">
        {[
          { field: 'title' as keyof GameCSVMapping, label: 'Title', required: true },
          { field: 'maxPlayers' as keyof GameCSVMapping, label: 'Max Players', required: true },
          { field: 'minPlayers' as keyof GameCSVMapping, label: 'Min Players', required: false },
          { field: 'category' as keyof GameCSVMapping, label: 'Category', required: false },
          { field: 'designer' as keyof GameCSVMapping, label: 'Designer', required: false },
          { field: 'publisher' as keyof GameCSVMapping, label: 'Publisher', required: false },
          { field: 'yearPublished' as keyof GameCSVMapping, label: 'Year Published', required: false },
          { field: 'complexity' as keyof GameCSVMapping, label: 'Complexity', required: false },
          { field: 'playingTime' as keyof GameCSVMapping, label: 'Playing Time', required: false },
          { field: 'description' as keyof GameCSVMapping, label: 'Description', required: false },
          { field: 'tags' as keyof GameCSVMapping, label: 'Tags', required: false },
          { field: 'link' as keyof GameCSVMapping, label: 'Link', required: false },
          { field: 'image' as keyof GameCSVMapping, label: 'Image URL', required: false }
        ].map(({ field, label, required }) => (
          <div key={field} className="grid grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={importOptions.mapping[field] || ''}
              onChange={(e) => handleMappingChange(field, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Column --</option>
              {headers.map((header, index) => (
                <option key={index} value={index.toString()}>
                  Column {index + 1}: {header}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500">
              {importOptions.mapping[field] && headers[parseInt(importOptions.mapping[field])] ? (
                <div className="flex items-center space-x-2">
                  <span>{headers[parseInt(importOptions.mapping[field])]}</span>
                  {/* Show auto-mapping indicator */}
                  {autoMappedFields.includes(field) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Auto
                    </span>
                  )}
                </div>
              ) : (
                'Not mapped'
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tag separator */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tag Separator (for tags column)
        </label>
        <input
          type="text"
          value={importOptions.tagSeparator}
          onChange={(e) => setImportOptions(prev => ({ ...prev, tagSeparator: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder=","
        />
      </div>

      {/* Preview */}
      <div>
        <h4 className="font-medium mb-2">Preview (first 3 rows)</h4>
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {csvLines.slice(importOptions.skipFirstRow ? 1 : 0, importOptions.skipFirstRow ? 4 : 3).map((line, index) => (
                <tr key={index}>
                  {line.split(',').map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900">
                      {cell.trim().replace(/"/g, '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep('upload')}
          className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
        >
          Back
        </button>
        <button
          onClick={handleImport}
          disabled={!importOptions.mapping.title || !importOptions.mapping.maxPlayers}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Import Games
        </button>
      </div>
    </div>
  );
  };

  const renderResultStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Import Complete</h3>
      </div>

      {importResult && (
        <div className={`p-4 rounded-md ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className={`font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {importResult.success ? '✅ Import Successful' : '❌ Import Failed'}
          </div>
          <div className={`text-sm mt-1 ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {importResult.imported} games imported successfully
          </div>
          {importResult.errors.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-red-800">Errors:</div>
              <ul className="text-sm text-red-700 list-disc list-inside mt-1">
                {importResult.errors.slice(0, 10).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {importResult.errors.length > 10 && (
                  <li>... and {importResult.errors.length - 10} more errors</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Import Games from CSV</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 'upload' && renderUploadStep()}
          {step === 'mapping' && renderMappingStep()}
          {step === 'result' && renderResultStep()}
        </div>
      </div>
    </div>
  );
}
